interface Position {
  top: number
  left: number
}

export const calculatePosition = (
  textSelectedRect: DOMRect,
  popupContainerRect: DOMRect,
): Position => {
  const bodyRect = document.body.getBoundingClientRect()
  const MARGIN = 8 // Margen de separación entre el texto y el popup

  // Calcula la posición horizontal centrada
  const left = Math.max(
    MARGIN,
    Math.min(
      textSelectedRect.left +
        (textSelectedRect.width - popupContainerRect.width) / 2,
      bodyRect.width - popupContainerRect.width - MARGIN,
    ),
  )

  // Determina si hay espacio suficiente debajo del texto
  const spaceBelow =
    bodyRect.height -
    (textSelectedRect.bottom + MARGIN + popupContainerRect.height)
  const spaceAbove = textSelectedRect.top - MARGIN - popupContainerRect.height

  let top
  if (spaceBelow >= 0) {
    // Posiciona debajo del texto si hay espacio suficiente
    top = textSelectedRect.bottom + MARGIN
  } else if (spaceAbove >= 0) {
    // Posiciona arriba del texto si hay espacio suficiente
    top = textSelectedRect.top - MARGIN - popupContainerRect.height
  } else {
    // Si no hay espacio suficiente ni arriba ni abajo,
    // posiciona donde haya más espacio disponible
    top =
      spaceBelow > spaceAbove
        ? textSelectedRect.bottom + MARGIN
        : textSelectedRect.top - MARGIN - popupContainerRect.height
  }

  return { top, left }
}
