function loadBillingData() {
  // Load billing dashboard with transactions
  loadAllTransactions();
}

function loadAllTransactions() {
  // In a real app, this would fetch from an API
  if (appData.bills.length === 0) {
    // Generate some sample bills based on other data
    generateSampleBills();
  }
  
  const billingPage = document.getElementById('billing-page');
  billingPage.innerHTML = '<h2>Billing Dashboard</h2>';
  
  // Summary cards
  const summaryCards = document.createElement('div');
  summaryCards.className = 'summary-cards';
  summaryCards.style.display = 'flex';
  summaryCards.style.gap = '15px';
  summaryCards.style.marginBottom = '20px';
  
  const totalAmount = appData.bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = appData.bills.filter(b => b.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  
  summaryCards.innerHTML = `
    <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h4 style="color: var(--text-light); margin-bottom: 10px;">Total Billing</h4>
      <p style="font-size: 1.5rem; color: var(--primary); font-weight: bold;">$${totalAmount.toFixed(2)}</p>
    </div>
    <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h4 style="color: var(--text-light); margin-bottom: 10px;">Paid</h4>
      <p style="font-size: 1.5rem; color: var(--success); font-weight: bold;">$${paidAmount.toFixed(2)}</p>
    </div>
    <div style="flex: 1; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h4 style="color: var(--text-light); margin-bottom: 10px;">Pending</h4>
      <p style="font-size: 1.5rem; color: var(--warning); font-weight: bold;">$${pendingAmount.toFixed(2)}</p>
    </div>
  `;
  
  billingPage.appendChild(summaryCards);
  
  // Transactions table
  const transactionsTable = document.createElement('table');
  transactionsTable.style.width = '100%';
  transactionsTable.style.borderCollapse = 'collapse';
  transactionsTable.style.marginTop = '15px';
  
  transactionsTable.innerHTML = `
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Patient</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Service</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Date</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Amount</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${appData.bills.map(bill => {
        const patient = appData.users.find(u => u.id === bill.patientId);
        return `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">${patient ? patient.name : 'Patient'}</td>
            <td style="padding: 10px;">${bill.service}</td>
            <td style="padding: 10px;">${new Date(bill.date).toLocaleDateString()}</td>
            <td style="padding: 10px;">$${bill.amount.toFixed(2)}</td>
            <td style="padding: 10px;">
              <span style="color: ${bill.paid ? 'var(--success)' : 'var(--warning)'}">
                ${bill.paid ? 'Paid' : 'Pending'}
              </span>
            </td>
            <td style="padding: 10px;">
              ${!bill.paid ? `
                <button class="btn btn-success mark-paid-btn" data-bill-id="${bill.id}" style="padding: 5px 10px; font-size: 0.8rem;">
                  Mark as Paid
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
  
  billingPage.appendChild(transactionsTable);
  
  // Add event listeners for mark as paid buttons
  document.querySelectorAll('.mark-paid-btn').forEach(btn => {
    btn.addEventListener('click', () => markBillAsPaid(btn.dataset.billId));
  });
}

function generateSampleBills() {
  // Generate bills based on appointments, prescriptions, and lab tests
  appData.appointments.forEach(appt => {
    if (appt.status === 'confirmed') {
      appData.bills.push({
        id: Date.now() + Math.random(),
        patientId: appt.patientId,
        service: `Doctor Consultation (${appt.dateTime})`,
        date: new Date(),
        amount: 100.00,
        paid: false
      });
    }
  });
  
  appData.prescriptions.forEach(pres => {
    if (pres.fulfilled) {
      appData.bills.push({
        id: Date.now() + Math.random(),
        patientId: pres.patientId,
        service: 'Medication Prescription',
        date: pres.fulfilledDate,
        amount: pres.medications.length * 15.00, // $15 per medication
        paid: false
      });
    }
  });
  
  appData.labTests.forEach(test => {
    if (test.result) {
      appData.bills.push({
        id: Date.now() + Math.random(),
        patientId: test.patientId,
        service: `Lab Test - ${test.testType}`,
        date: test.completedDate,
        amount: 50.00, // $50 per test
        paid: false
      });
    }
  });
}

function markBillAsPaid(billId) {
  const bill = appData.bills.find(b => b.id == billId);
  if (!bill) return;
  
  bill.paid = true;
  bill.paymentDate = new Date();
  
  // Send notification to patient
  sendNotification(
    appData.currentUser.id,
    bill.patientId,
    `Payment received for ${bill.service} ($${bill.amount.toFixed(2)})`,
    'payment_received'
  );
  
  alert('Bill marked as paid!');
  loadAllTransactions(); // Refresh the list
}   
