document.addEventListener('DOMContentLoaded', function() {
    const fechaChk = document.getElementById('fechaChk');
    fechaChk.value = new Date().toISOString().split('T')[0];
    
    // Listeners para todos radios
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', calcularCumplimiento);
    });
    
    // Validación especial campo 9 (crítico)
    const obs9 = document.querySelector('input[name="chk9"] ~ td .obs');
    obs9.addEventListener('input', function() {
        const chk9si = document.querySelector('input[name="chk9"][value="si"]:checked');
        if (chk9si && !this.value.trim().includes('preaviso') && !this.value.trim().includes('indemn')) {
            this.setCustomValidity('Especifica PREAVISO 30d o INDEMNIZACIÓN (Ley 2466 obligatorio)');
            this.style.borderColor = '#dc3545';
        } else {
            this.setCustomValidity('');
            this.style.borderColor = '#28a745';
        }
    });
});

function calcularCumplimiento() {
    let totalSi = 0;
    for (let i = 1; i <= 10; i++) {
        if (document.querySelector(`input[name="chk${i}"][value="si"]:checked`)) totalSi++;
    }
    
    const porc = ((totalSi / 10) * 100).toFixed(0);
    const resultado = document.getElementById('resultado');
    
    if (totalSi === 10) {
        resultado.innerHTML = `✅ <strong>APROBADO TOTAL</strong><br>10/10 SÍ (${porc}%)<br>📱 Enviar foto HQ ahora`;
        resultado.className = 'resultado ok';
    } else if (totalSi >= 8) {
        resultado.innerHTML = `⚠️ <strong>PENDIENTE</strong><br>${totalSi}/10 SÍ (${porc}%)<br>❗ Corrige ${10-totalSi} ítems`;
        resultado.className = 'resultado warning';
    } else {
        resultado.innerHTML = `❌ <strong>BLOQUEADO</strong><br>${totalSi}/10 SÍ (${porc}%)<br>🚫 No firmar hasta 100%`;
        resultado.className = 'resultado error';
    }
    resultado.style.display = 'block';
}

function generarPDFChecklist() {
    const totalSi = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
        .filter(r => r.value === 'si').length;
    
    if (totalSi !== 10) {
        alert('❌ ¡Requiere 100% SÍ (10/10) para PDF oficial!\nCorrige primero.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Header
    doc.setFillColor(40,167,69); doc.rect(0, 0, 297, 28, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(22);
    doc.text('CHECKLIST APROBADO 100% - CAPITAL INVESTMENTS S.A.S.', 15, 20);
    
    // Datos cabecera
    doc.setFontSize(12); doc.setTextColor(0,0,0);
    doc.text(`Sucursal: ${document.getElementById('sucursal').value}`, 15, 38);
    doc.text(`Fecha: ${document.getElementById('fechaChk').value}`, 120, 38);
    doc.text(`Contrato Nº: ${document.getElementById('numContrato').value}`, 200, 38);
    doc.text(`Empleado: ${document.getElementById('empleado').value}`, 15, 50);
    
    // Tabla checklist ✓
    const body = [];
    for (let i = 1; i <= 10; i++) {
        const obs = document.querySelector(`input[name="chk${i}"][value="si"] ~ td .obs`).value || 'OK';
        body.push([i, `Ítem ${i} ✓`, '', '', obs]);
    }
    
    doc.autoTable({
        startY: 60,
        head: [['№', 'ÍTEM VERIFICADO', 'SÍ', 'NO', 'OBSERVACIONES']],
        body: body,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 6, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [40,167,69], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        columnStyles: { 0: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' } },
        alternateRowStyles: { fillColor: [248,249,250] },
        margin: { left: 15, right: 15 }
    });
    
    // Footer PDF
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('✓ APROBADO 100% - ARCHIVAR Y REGISTRAR PILA', 15, finalY);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Firma Verificador: ___________________________ Cargo: _________________ Fecha: _______________', 15, finalY + 8);
    
    const nombrePDF = `checklist_${document.getElementById('empleado').value.replace(/[^a-z0-9]/gi,'_')}_${document.getElementById('fechaChk').value}.pdf`;
    doc.save(nombrePDF);
    
    document.getElementById('resultado').innerHTML = '✅ PDF Oficial generado y descargado';
    document.getElementById('resultado').className = 'resultado ok';
}

function resetChecklist() {
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('.obs').forEach(o => o.value = '');
    document.getElementById('resultado').style.display = 'none';
    document.getElementById('fechaChk').value = new Date().toISOString().split('T')[0];
    alert('✅ Checklist limpio. Marca nuevo contrato.');
}
