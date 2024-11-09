import mongoose from "mongoose";

const patientHealthSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  primaryCareDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientHealthSchema);
export default Patient


// this schema belongs to other microservice but in order to populate data in report, we need this.
// some reports need patient data thats why we use ref of patient there