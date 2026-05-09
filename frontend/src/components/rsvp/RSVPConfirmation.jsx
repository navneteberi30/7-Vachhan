export default function RSVPConfirmation({ attending }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{attending ? '🎉' : '💌'}</div>
      <h2 style={{ color: attending ? '#059669' : '#374151' }}>
        {attending ? 'See you there!' : 'We\'ll miss you!'}
      </h2>
      <p style={{ color: '#6b7280' }}>
        {attending
          ? 'Your RSVP has been confirmed. We can\'t wait to celebrate with you.'
          : 'Your response has been recorded. Thank you for letting us know.'}
      </p>
    </div>
  )
}
