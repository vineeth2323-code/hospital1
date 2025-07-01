function loadLabData() {
  // Load lab tests that need results
  loadPendingLabTests();
}

function loadPendingLabTests() {
  // In a real app, this would filter by status and lab admin
  const tests = appData.labTests.filter(test => !test.result);
  
  const testsList = document.createElement('div');
  testsList.className = 'lab-tests-list';
  
  if (tests.length === 0) {
    testsList.innerHTML = '<p>No pending lab tests found.</p>';
  } else {
    tests.forEach(test => {
      const patient = appData.users.find(u => u.id === test.patientId);
      const doctor = appData.users.find(u => u.id === test.doctorId);
      const card = document.createElement('div');
      card.className = 'lab-test-card';
      card.innerHTML = `
        <h4>Test for ${patient ? patient.name : 'Patient'}</h4>
        <p><strong>Test Type:</strong> ${test.testType}</p>
        <p><strong>Ordered by:</strong> ${doctor ? doctor.name : 'Doctor'}</p>
        <p><strong>Order Date:</strong> ${new Date(test.orderDate).toLocaleDateString()}</p>
        <div class="form-group">
          <label for="result-${test.id}">Test Result</label>
          <textarea id="result-${test.id}" rows="3" required></textarea>
        </div>
        <button class="btn btn-primary submit-result" data-test-id="${test.id}">Submit Result</button>
      `;
      testsList.appendChild(card);
    });
    
    // Add event listeners for submit buttons
    document.querySelectorAll('.submit-result').forEach(btn => {
      btn.addEventListener('click', () => submitLabResult(btn.dataset.testId));
    });
  }
  
  const labPage = document.getElementById('lab-page');
  labPage.innerHTML = '';
  labPage.appendChild(testsList);
}

function submitLabResult(testId) {
  const test = appData.labTests.find(t => t.id == testId);
  if (!test) return;
  
  const resultText = document.getElementById(`result-${testId}`).value;
  if (!resultText) {
    alert('Please enter test results');
    return;
  }
  
  test.result = resultText;
  test.completedDate = new Date();
  
  // Send notification to patient
  sendNotification(
    appData.currentUser.id,
    test.patientId,
    `Your lab test results for ${test.testType} are available`,
    'lab_results'
  );
  
  // Also notify doctor
  sendNotification(
    appData.currentUser.id,
    test.doctorId,
    `Lab results available for ${test.testType} (Patient ID: ${test.patientId})`,
    'lab_results_doctor'
  );
  
  alert('Test results submitted successfully!');
  loadPendingLabTests(); // Refresh the list
}
