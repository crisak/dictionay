✅ 1. Usa data-testid solo cuando no hay otra forma

Testing Library promueve que encuentres elementos como lo haría un usuario, es decir:

Preferido Ejemplo
getByRole getByRole('button', { name: /enviar/i })
getByLabelText Inputs con su <label> asociado
getByText Para textos visibles
getByPlaceholderText Inputs con placeholder
getByAltText Imágenes con alt

Solo usa data-testid como último recurso, por ejemplo si el componente no tiene texto o rol, tipo un <div> dinámico.

<div data-testid="error-message">{error}</div>

Y en el test:

expect(screen.getByTestId('error-message')).toHaveTextContent('Oops!')

⸻

✅ 2. Componentes pequeños y puros

Evita componentes gigantes con mil responsabilidades. En lugar de eso:
• Separa lógica en hooks (useLogin, useFormData, etc).
• Usa componentes presentacionales (LoginFormUI) y componentes con lógica (LoginFormContainer).
• Así puedes testear lo visual por un lado y lo funcional por otro.

⸻

✅ 3. Evita console.log, prefiere estados controlados

Si quieres saber si algo pasó, como un error, un submit, un cambio de estado… hazlo observable. Es decir, que puedas testearlo.

En vez de esto:

const handleClick = () => {
console.log('Clicked!')
}

Haz esto:

const handleClick = () => {
setClicked(true)
}

Y en el test:

fireEvent.click(screen.getByRole('button'))
expect(screen.getByTestId('clicked-flag')).toBeInTheDocument()

⸻

✅ 4. Usa aria-label, aria-labelledby, role, etc

Estos atributos hacen que tu componente sea más accesible y más testeable, porque los roles y nombres son claves para Testing Library.

<input aria-label="Correo electrónico" />

expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()

⸻

✅ 5. Mockea dependencias externas (traducciones, auth, router, etc)

Tu componente debería funcionar aún si el backend se cae o si el router está en Marte. Usa vi.mock() para aislarlo.

vi.mock('next-intl', () => ({
useTranslations: vi.fn().mockReturnValue((key) => key),
}))

⸻

✅ 6. Añade textos claros y semántica HTML

Testing Library busca por texto visible. Así que si escribes:

<span>Click aquí</span>

Es mejor poner:

<button>Enviar</button>

O:

<label htmlFor="email">Correo electrónico</label>
<input id="email" />

Y te ganas el cielo de la accesibilidad y del testing al tiempo.

⸻

✅ 7. Nombra bien los testid si los usas

Usa nombres que tengan sentido para el usuario, no para ti como dev:

❌ Malo: data-testid="main-div"
✅ Bueno: data-testid="login-error-message"

⸻

🔁 8. Evita lógica interna oculta

Todo lo que no puedas controlar en el test, será difícil de testear. Por eso:
• Evita side effects directos en useEffect sin condiciones.
• Usa props para inyectar callbacks o mocks.

⸻

💡 Extra: Testear el resultado, no la implementación

No testees si useState se llama, ni cuántas veces se hace un setX. Testea lo que el usuario ve.

⸻
