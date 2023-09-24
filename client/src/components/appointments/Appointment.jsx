const fontSize = {
  fontSize: '1.25rem',
  fontWeight: '700',
};

export default function Appointment({ children, appointment }) {
  return (
    <>
      <div style={{ ...fontSize, marginBottom: '1rem' }}>
        {appointment.date && (
          <span style={{ marginRight: '1rem' }}>{appointment.date}</span>
        )}
        <span>{appointment.start}</span>
      </div>
      <div style={fontSize}>{appointment.service}</div>
      {children}
    </>
  );
}
