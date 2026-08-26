// lib/twiml_scripts.ts
// TwiML scripts for common secretary calls

// Call a dentist to book an appointment
export function dentistBookingTwiML({
  userName,
  symptoms,
  preferredTime,
  insuranceProvider,
  callbackNumber,
}: {
  userName: string;
  symptoms: string;
  preferredTime: string;
  insuranceProvider?: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} to book a dental appointment.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        They are experiencing ${symptoms} and would like to schedule an appointment as soon as possible.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        They prefer ${preferredTime} appointments.
      </Say>
      ${insuranceProvider ? `
      <Say voice="alice" rate="medium">
        Their insurance provider is ${insuranceProvider}.
      </Say>
      ` : ""}
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        Please call back ${callbackNumber} or text to confirm availability.
        If you have online booking, you can also send the link via text message.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}

// Call a bank to dispute a fee
export function bankFeeDisputeTwiML({
  userName,
  accountId,
  feeAmount,
  feeDate,
  reason,
  callbackNumber,
}: {
  userName: string;
  accountId: string;
  feeAmount: number;
  feeDate: string;
  reason: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} regarding account number ${accountId}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        They noticed a fee of $${feeAmount} charged on ${feeDate} that they would like to dispute.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        The reason for dispute is: ${reason}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        They are requesting a full refund of this fee.
        Please call back ${callbackNumber} to discuss this matter.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}

// Call a pharmacy to check prescription availability
export function pharmacyPrescriptionCheckTwiML({
  userName,
  prescriptionName,
  doctorName,
  callbackNumber,
}: {
  userName: string;
  prescriptionName: string;
  doctorName: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} to check on a prescription.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        The prescription is for ${prescriptionName}, prescribed by Dr. ${doctorName}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        Could you please confirm if it's ready for pickup?
        If so, please text ${callbackNumber} with the total cost and pickup instructions.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}

// Call a service provider to cancel subscription
export function cancelSubscriptionTwiML({
  userName,
  accountEmail,
  serviceName,
  reason,
  callbackNumber,
}: {
  userName: string;
  accountEmail: string;
  serviceName: string;
  reason: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} to cancel their ${serviceName} subscription.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        The account email is ${accountEmail}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        The reason for cancellation is: ${reason}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        Please confirm the cancellation via email or text to ${callbackNumber}.
        Also confirm the final billing date and any remaining balance.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}

// Call a restaurant to make a reservation
export function restaurantReservationTwiML({
  userName,
  partySize,
  date,
  time,
  specialRequests,
  callbackNumber,
}: {
  userName: string;
  partySize: number;
  date: string;
  time: string;
  specialRequests?: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} to make a dinner reservation.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        They would like to reserve a table for ${partySize} people on ${date} at ${time}.
      </Say>
      ${specialRequests ? `
      <Say voice="alice" rate="medium">
        Special requests: ${specialRequests}.
      </Say>
      ` : ""}
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        Please confirm the reservation via text to ${callbackNumber}.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}

// General inquiry call (flexible)
export function generalInquiryTwiML({
  userName,
  businessName,
  message,
  callbackNumber,
}: {
  userName: string;
  businessName: string;
  message: string;
  callbackNumber: string;
}) {
  return `
    <Response>
      <Say voice="alice" rate="medium">
        Hello, I'm calling on behalf of ${userName} regarding ${businessName}.
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        ${message}
      </Say>
      <Pause length="1"/>
      <Say voice="alice" rate="medium">
        Please call back or text ${callbackNumber} to respond.
      </Say>
      <Pause length="0.5"/>
      <Say voice="alice" rate="medium">
        Thank you for your time. Goodbye.
      </Say>
    </Response>
  `;
}
