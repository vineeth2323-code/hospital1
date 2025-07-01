function loadDoctorData() {
  // Load doctor's appointments
  loadDoctorAppointments();
}

function loadDoctorAppointments() {
  const appointments = appData.appointments.filter(
    appt => appt.doctorId === appData.currentUser.id
  );
  
  const appointmentsList = document.createElement('div');
  appointmentsList.className = 'appointments-list';
  
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<p>No appointments found.</p>';
  } else {
    appointments.forEach(appt => {
      const patient = appData.users.find(u => u.id === appt.patientId);
      const card = document.createElement('div');
      card.className = 'appointment-card';
      card.innerHTML = `
        <h4>Appointment with ${patient ? patient.name : 'Patient'}</h4>
        <p><strong>Date/Time:</strong> ${appt.dateTime}</p>
        <p><strong>Reason:</strong> ${appt.reason}</p>
        <p><strong>Status:</strong> <span class="status-${appt.status}">${appt.status}</span></p>
        <div class="action-buttons" style="margin-top: 10px;">
          ${appt.status === 'pending' ? `
            <button class="btn btn-success accept-btn" data-appointment-id="${appt.id}">Accept</button>
            <button class="btn btn-danger reject-btn" data-appointment-id="${appt.id}">Reject</button>
          ` : ''}
          ${appt.status === 'confirmed' ? `
            <button class="btn btn-primary prescribe-btn" data-appointment-id="${appt.id}">Create Prescription</button>
          ` : ''}
        </div>
      `;
      appointmentsList.appendChild(card);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', () => updateAppointmentStatus(btn.dataset.appointmentId, 'confirmed'));
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => updateAppointmentStatus(btn.dataset.appointmentId, 'rejected'));
    });
    
    document.querySelectorAll('.prescribe-btn').forEach(btn => {
      btn.addEventListener('click', () => showPrescriptionForm(btn.dataset.appointmentId));
    });
  }
  
  const doctorPage = document.getElementById('doctor-page');
  doctorPage.innerHTML = '';
  doctorPage.appendChild(appointmentsList);
}

function updateAppointmentStatus(appointmentId, status) {
  const appointment = appData.appointments.find(appt => appt.id == appointmentId);
  if (appointment) {
    appointment.status = status;
    
    // Send notification to patient
    sendNotification(
      appData.currentUser.id,
      appointment.patientId,
      `Your appointment on ${appointment.dateTime} has been ${status}`,
      'appointment_update'
    );
    
    // Reload appointments
    loadDoctorAppointments();
  }
}

function showPrescriptionForm(appointmentId) {
  const appointment = appData.appointments.find(appt => appt.id == appointmentId);
  if (!appointment) return;
  
  const patient = appData.users.find(u => u.id === appointment.patientId);
  
  const form = document.createElement('form');
  form.id = 'prescription-form';
  form.innerHTML = `
    <h3>Create Prescription for ${patient ? patient.name : 'Patient'}</h3>
    <div id="medication-list"></div>
    <button type="button" class="btn btn-info" id="add-medication" style="margin-bottom: 15px;">Add Medication</button>
    <div class="form-group">
      <label for="prescription-instructions">Instructions</label>
      <textarea id="prescription-instructions" rows="3" required></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Save Prescription</button>
  `;
  
  // Add initial medication field
  addMedicationField();
  
  // Handle add medication button
  form.querySelector('#add-medication').addEventListener('click', addMedicationField);
  
  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const medications = [];
    document.querySelectorAll('.medication-item').forEach(item => {
      const name = item.querySelector('.med-name').value;
      const dosage = item.querySelector('.med-dosage').value;
      if (name && dosage) {
        medications.push({ name, dosage });
      }
    });
    
    const instructions = document.getElementById('prescription-instructions').value;
    
    if (medications.length === 0) {
      alert('Please add at least one medication');
      return;
    }
    
    // Create new prescription
    const newPrescription = {
      id: Date.now(),
      patientId: appointment.patientId,
      doctorId: appData.currentUser.id,
      date: new Date(),
      medications,
      instructions
    };
    
    appData.prescriptions.push(newPrescription);
    
    // Send notification to patient
    sendNotification(
      appData.currentUser.id,
      appointment.patientId,
      `New prescription available from ${appData.currentUser.name}`,
      'new_prescription'
    );
    
    // Also notify pharmacy
    const pharmacyUser = appData.users.find(u => u.role === 'pharmacy');
    if (pharmacyUser) {
      sendNotification(
        appData.currentUser.id,
        pharmacyUser.id,
        `New prescription for ${patient ? patient.name : 'Patient'}`,
        'pharmacy_prescription'
      );
    }
    
    alert('Prescription created successfully!');
    loadDoctorAppointments(); // Go back to appointments list
  });
  
  const doctorPage = document.getElementById('doctor-page');
  doctorPage.innerHTML = '';
  doctorPage.appendChild(form);
}

function addMedicationField() {
  const medicationList = document.getElementById('medication-list');
  if (!medicationList) return;
  
  const medicationItem = document.createElement('div');
  medicationItem.className = 'medication-item';
  medicationItem.style.marginBottom = '10px';
  medicationItem.style.padding = '10px';
  medicationItem.style.border = '1px solid #ddd';
  medicationItem.style.borderRadius = '5px';
  medicationItem.innerHTML = `
    <div class="form-group">
      <label>Medication Name</label>
      <input type="text" class="med-name" required>
    </div>
    <div class="form-group">
      <label>Dosage</label>
      <input type="text" class="med-dosage" required>
    </div>
    <button type="button" class="btn btn-danger remove-med" style="padding: 5px 10px; font-size: 0.8rem;">Remove</button>
  `;
  
  medicationItem.querySelector('.remove-med').addEventListener('click', () => {
    medicationItem.remove();
  });
  
  medicationList.appendChild(medicationItem);
}
