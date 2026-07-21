interface AllergyWarningProps {
  allergens: string[];
}

// Allergy conflicts are a hard gate — must never rely on color alone. This
// component always pairs the warning icon with explicit text.
export function AllergyWarning({ allergens }: AllergyWarningProps) {
  if (allergens.length === 0) return null;

  return (
    <div className="allergen-warning" role="alert">
      <span aria-hidden="true">⚠</span>
      <span>Contains: {allergens.join(', ')}</span>
    </div>
  );
}
