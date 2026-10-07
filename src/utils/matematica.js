export function somar(a, b) {
  return a + b;
}

export function mediaTurma(...notas) {
  if (!notas.length) return 0;

  const total = notas.reduce((acumulador, nota) => acumulador + nota, 0);
  return total / notas.length;
}
