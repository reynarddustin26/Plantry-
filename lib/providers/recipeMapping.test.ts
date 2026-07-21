import { describe, expect, it } from 'vitest';
import { deriveTags, inferAllergensFromIngredients, mapCourse, parseMeasure } from './recipeMapping';

describe('mapCourse', () => {
  it('maps known TheMealDB categories to our course taxonomy', () => {
    expect(mapCourse('Breakfast')).toBe('breakfast');
    expect(mapCourse('Dessert')).toBe('dessert');
    expect(mapCourse('Starter')).toBe('snack');
    expect(mapCourse('Side')).toBe('snack');
  });

  it('defaults unmapped categories to main', () => {
    expect(mapCourse('Seafood')).toBe('main');
    expect(mapCourse('Vegetarian')).toBe('main');
  });
});

describe('deriveTags', () => {
  it('tags vegan and vegetarian from the source category', () => {
    expect(deriveTags('Vegan')).toEqual(['vegan']);
    expect(deriveTags('Vegetarian')).toEqual(['vegetarian']);
  });

  it('returns no tags for categories with no dietary claim', () => {
    expect(deriveTags('Chicken')).toEqual([]);
  });
});

describe('parseMeasure', () => {
  it('parses a simple integer measure', () => {
    expect(parseMeasure('2 tbsp')).toEqual({ quantity: 2, unit: 'tbsp' });
  });

  it('parses a decimal measure', () => {
    expect(parseMeasure('1.5 cups')).toEqual({ quantity: 1.5, unit: 'cups' });
  });

  it('parses a simple fraction', () => {
    expect(parseMeasure('1/2 cup')).toEqual({ quantity: 0.5, unit: 'cup' });
  });

  it('parses a mixed-number fraction', () => {
    expect(parseMeasure('1 1/2 cups')).toEqual({ quantity: 1.5, unit: 'cups' });
  });

  it('never fabricates a number for purely descriptive measures', () => {
    expect(parseMeasure('to taste')).toEqual({ quantity: 1, unit: 'to taste' });
  });

  it('falls back to a unit placeholder for an empty measure', () => {
    expect(parseMeasure('')).toEqual({ quantity: 1, unit: 'unit' });
    expect(parseMeasure('   ')).toEqual({ quantity: 1, unit: 'unit' });
  });
});

describe('inferAllergensFromIngredients', () => {
  it('detects dairy and gluten from ingredient text', () => {
    expect(inferAllergensFromIngredients(['Milk', 'Plain Flour'])).toEqual(
      expect.arrayContaining(['dairy', 'gluten']),
    );
  });

  it('detects tree nut and peanut distinctly', () => {
    const result = inferAllergensFromIngredients(['Almonds', 'Peanut Butter']);
    expect(result).toEqual(expect.arrayContaining(['tree nut', 'peanut']));
  });

  it('returns an empty array when no known allergen keyword matches', () => {
    expect(inferAllergensFromIngredients(['Chicken Breast', 'Olive Oil', 'Salt'])).toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(inferAllergensFromIngredients(['SOY SAUCE'])).toEqual(['soy']);
  });
});
