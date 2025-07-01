function loadPatientData() {
  // Initialize patient tabs
  const tabBtns = document.querySelectorAll('.patient-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.patient-page .tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Update active tab
      tabBtns.forEach(tb => tb.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // Load appointment booking form if it exists
  const bookAppointmentTab = document.getElementById('book-appointment');
  if (bookAppointmentTab) {
    loadDoctorAvailability();
    setupAppointmentForm();
  }
  
  // Load appointments if the tab exists
  const viewAppointmentsTab = document.getElementById('view-appointments');
  if (viewAppointmentsTab) {
    loadPatientAppointments();
  }
  
  // Load prescriptions if the tab exists
  const prescriptionsTab = document.getElementById('prescriptions');
  if (prescriptionsTab) {
    loadPatientPrescriptions();
  }
}

function loadDoctorAvailability() {
  // In a real app, this would fetch from an API
  const doctors = [
    { id: 1, name: 'Dr. Smith', specialty: 'Cardiology', availableSlots: ['2023-11-15 09:00', '2023-11-15 11:00', '2023-11-16 10:00'] },
    { id: 2, name: 'Dr. Johnson', specialty: 'Pediatrics', availableSlots: ['2023-11-15 14:00', '2023-11-16 09:00'] },
    { id: 3, name: 'Dr. Williams', specialty: 'Orthopedics', availableSlots: ['2023-11-17 10:00', '2023-11-17 14:00'] }
  ];
  
  const doctorSelect = document.createElement('select');
  doctorSelect.id = 'doctor-select';
  doctorSelect.innerHTML = doctors.map(doctor => 
    `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`
  ).join('');
  
  const slotSelect = document.createElement('select');
  slotSelect.id = 'slot-select';
  slotSelect.disabled = true;
  
  doctorSelect.addEventListener('change', () => {
    const selectedDoctor = doctors.find(d => d.id == doctorSelect.value);
    slotSelect.innerHTML = selectedDoctor.availableSlots.map(slot => 
      `<option value="${slot}">${slot}</option>`
    ).join('');
    slotSelect.disabled = false;
  });
  
  // Trigger change event to populate slots for first doctor
  if (doctors.length > 0) {
    doctorSelect.dispatchEvent(new Event('change'));
  }
  
  const form = document.createElement('form');
  form.id = 'appointment-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="appointment-reason">Reason for Appointment</label>
      <textarea id="appointment-reason" rows="3" required></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Book Appointment</button>
  `;
  
  form.prepend(createFormGroup('Doctor', doctorSelect));
  form.prepend(createFormGroup('Available Slots', slotSelect));
  
  const bookAppointmentTab = document.getElementById('book-appointment');
  bookAppointmentTab.innerHTML = '';
  bookAppointmentTab.appendChild(form);
}

function createFormGroup(labelText, inputElement) {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = inputElement.id;
  
  group.appendChild(label);
  group.appendChild(inputElement);
  return group;
}

function setupAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const doctorId = document.getElementById('doctor-select').value;
      const slot = document.getElementById('slot-select').value;
      const reason = document.getElementById('appointment-reason').value;
      
      // Create new appointment
      const newAppointment = {
        id: Date.now(),
        patientId: appData.currentUser.id,
        doctorId: parseInt(doctorId),
        dateTime: slot,
        reason,
        status: 'pending',
        createdAt: new Date()
      };
      
      appData.appointments.push(newAppointment);
      
      // Send notification to doctor
      const doctor = appData.users.find(u => u.id == doctorId);
      sendNotification(
        appData.currentUser.id,
        doctorId,
        `New appointment request from ${appData.currentUser.name} for ${slot}`,
        'appointment_request'
      );
      
      alert('Appointment requested successfully!');
      form.reset();
      loadPatientAppointments(); // Refresh appointments list
    });
  }
}

function loadPatientAppointments() {
  const appointments = appData.appointments.filter(
    appt => appt.patientId === appData.currentUser.id
  );
  
  const appointmentsList = document.createElement('div');
  appointmentsList.className = 'appointments-list';
  
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<p>No appointments found.</p>';
  } else {
    appointments.forEach(appt => {
      const doctor = appData.users.find(u => u.id === appt.doctorId);
      const card = document.createElement('div');
      card.className = 'appointment-card';
      card.innerHTML = `
        <h4>Appointment with ${doctor ? doctor.name : 'Doctor'}</h4>
        <p><strong>Date/Time:</strong> ${appt.dateTime}</p>
        <p><strong>Reason:</strong> ${appt.reason}</p>
        <p><strong>Status:</strong> <span class="status-${appt.status}">${appt.status}</span></p>
      `;
      appointmentsList.appendChild(card);
    });
  }
  
  const viewAppointmentsTab = document.getElementById('view-appointments');
  viewAppointmentsTab.innerHTML = '';
  viewAppointmentsTab.appendChild(appointmentsList);
}

function loadPatientPrescriptions() {
  const prescriptions = appData.prescriptions.filter(
    pres => pres.patientId === appData.currentUser.id
  );
  
  const prescriptionsList = document.createElement('div');
  prescriptionsList.className = 'prescriptions-list';
  
  if (prescriptions.length === 0) {
    prescriptionsList.innerHTML = '<p>No prescriptions found.</p>';
  } else {
    prescriptions.forEach(pres => {
      const doctor = appData.users.find(u => u.id === pres.doctorId);
      const card = document.createElement('div');
      card.className = 'prescription-card';
      card.innerHTML = `
        <h4>Prescription from ${doctor ? doctor.name : 'Doctor'}</h4>
        <p><strong>Date:</strong> ${new Date(pres.date).toLocaleDateString()}</p>
        <p><strong>Medications:</strong></p>
        <ul>
          ${pres.medications.map(med => `<li>${med.name} - ${med.dosage}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong> ${pres.instructions}</p>
      `;
      prescriptionsList.appendChild(card);
    });
  }
  
  const prescriptionsTab = document.getElementById('prescriptions');
  prescriptionsTab.innerHTML = '';
  prescriptionsTab.appendChild(prescriptionsList);
}
