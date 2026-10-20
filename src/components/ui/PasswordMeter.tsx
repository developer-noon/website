/** Four bars that fill as a password gets stronger. The colour and bar count carry the message. */
export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function PasswordMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrength(password);
  const color = score <= 1 ? 'var(--color-danger)' : score === 2 ? 'var(--color-warning)' : 'var(--color-success)';
  return (
    <div className="flex gap-1.5" role="img" aria-label={`Password strength ${score} of 4`}>
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className="h-1.5 flex-1 rounded-full transition-colors duration-300"
          style={{ backgroundColor: index < score ? color : 'var(--color-border)' }}
        />
      ))}
    </div>
  );
}
