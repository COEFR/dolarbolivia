import { Article } from '@/types/rates';

export const ARTICLES: Article[] = [
  {
    slug: 'como-comparar-plataformas-p2p-sin-mirar-solo-la-tasa',
    title: 'Cómo comparar plataformas P2P sin mirar solo la tasa de cambio',
    excerpt: 'Encontrar el mejor valor al comprar o vender dólares no depende únicamente de la cifra destacada. Comisiones ocultas, límites por transacción y tiempo de liberación definen el costo real.',
    category: 'Guías P2P',
    date: '14 de Febrero, 2025',
    readTime: '5 min de lectura',
    author: 'Unidad de Análisis Financiero DólarBolivia',
    content: `
### El espejismo de la mejor tasa

Cuando un usuario ingresa a un mercado P2P (Peer-to-Peer), la reacción instintiva es ordenar los anuncios por la tasa de cambio más ventajosa. Sin embargo, en el mercado cambiario paralelo en Bolivia, el precio mostrado en pantalla es solo uno de los cuatro pilares de una operación eficiente.

Un anuncio que ofrece **10.85 BOB por USD** puede terminar resultando más costoso o riesgoso que uno que cotiza en **10.78 BOB por USD** si no se evalúan los siguientes factores clave:

---

### 1. El volumen mínimo y los tramos de liquidez

Muchos de los comerciantes P2P con las tasas más competitivas imponen mínimos de transacción elevados (por ejemplo, mínimo $500 USD o 5,000 BOB). Si tu requerimiento es de menor magnitud ($50 USD o $100 USD), quedarás relegado a comerciantes con spreads más amplios.

* **Recomendación:** Filtra siempre ingresando primero el monto exacto en bolivianos que planeas transferir por tu banca móvil antes de revisar la lista de comerciantes.

---

### 2. Métodos de pago e interbancariedad

En Bolivia, el método de pago influye directamente en la velocidad y comisiones:

* **Mismo banco (ej. Mercantil a Mercantil):** La transferencia es instantánea y no genera comisiones extra.
* **Transferencias ACH / Cuentas de terceros:** Pueden sufrir demoras de verificación por parte del cajero P2P, reteniendo los activos en garantía (*escrow*) durante horas.
* **Cobro por uso de QR Simple:** Aunque es ágil, algunas entidades imponen límites diarios de recepción que pueden congelar una orden en curso.

---

### 3. Reputación, porcentaje de finalización y antigüedad

La tasa de cambio carece de valor si la contraparte tarda 45 minutos en liberar los USDT o solicitar comprobantes adicionales no estipulados en los términos del anuncio.

Al evaluar una oferta, verifica:
1. **Completado de órdenes:** Debe ser mayor al **97%** en los últimos 30 días.
2. **Tiempo promedio de pago/liberación:** Idealmente menor a 10 minutos.
3. **Cantidad de órdenes terminadas:** Prioriza comerciantes con más de 200 operaciones exitosas.

---

### Resumen checklist antes de operar
* ¿Ingresé el monto exacto antes de ver las tasas?
* ¿Coincide mi banco emisor con la cuenta del comerciante?
* ¿Tiene el comerciante más del 97% de efectividad?
* ¿Leí los términos específicos del anuncio (no acepta cuentas de terceros)?
    `,
  },
  {
    slug: 'que-es-el-spread-p2p-y-como-afecta-el-costo-real',
    title: 'Qué es el spread P2P y cómo afecta el costo real de tus transacciones',
    excerpt: 'Comprender la diferencia entre el precio de compra y el de venta es fundamental para calcular la brecha cambiaria y minimizar la pérdida de capital al comerciar divisas.',
    category: 'Análisis',
    date: '10 de Febrero, 2025',
    readTime: '4 min de lectura',
    author: 'Equipo Económico DólarBolivia',
    content: `
### ¿Qué es el Spread Cambiario?

El **spread** es la diferencia matemática entre el precio al que un mercado o comerciante está dispuesto a **comprar** un dólar (tasa de compra) y el precio al que está dispuesto a **venderlo** (tasa de venta).

> **Fórmula simple:**  
> \`Spread = Tasa de Venta - Tasa de Compra\`

Si en Binance P2P la oferta de venta más baja es de **10.80 BOB/USD** y la oferta de compra más alta es de **10.63 BOB/USD**, el spread del mercado en ese instante es de **0.17 BOB por dólar** (aproximadamente un 1.58%).

---

### Por qué existe el spread en el mercado boliviano

En los mercados tradicionales con liquidez ilimitada, el spread tiende a ser de centésimas de centavo. En Bolivia, el spread del mercado paralelo/P2P refleja:

1. **Prima de riesgo y volatilidad:** El comerciante busca protegerse ante variaciones bruscas durante el tiempo que mantiene la posición en bolivianos o USDT.
2. **Costo de reposición:** La dificultad que tiene el creador de mercado (*market maker*) para volver a conseguir dólares físicos o digitales.
3. **Comisiones internas de la plataforma:** Las comisiones que cobra la plataforma al anunciante son trasladadas al spread final que ve el usuario.

---

### Cómo calcular el impacto en tu bolsillo

Imagina que necesitas comprar $100 USD para una compra en línea y una semana después decides reconvertir esos $100 USD nuevamente a bolivianos.

* **Día 1 (Compra):** Pagas $100 \\times 10.80 = 1,080\\text{ BOB}$
* **Día 7 (Venta):** Recibes $100 \\times 10.63 = 1,063\\text{ BOB}$
* **Pérdida por spread:** **17 BOB** por cada $100 USD intercambiados.

---

### Estrategias para reducir el impacto del spread
* **Pasa de taker a maker:** En lugar de aceptar los anuncios existentes, crea tu propio anuncio en la plataforma. De esta manera, tú fijas la tasa dentro del spread y ahorras comisiones.
* **Monitorea los horarios de mayor liquidez:** Entre las 09:00 y las 18:00 (hora boliviana) el spread suele estrecharse debido al alto volumen de comerciantes activos.
    `,
  },
  {
    slug: 'diferencia-entre-el-dolar-oficial-y-el-paralelo-en-bolivia',
    title: 'Diferencia entre el dólar oficial y el dólar paralelo en Bolivia: Guía conceptual',
    excerpt: 'Un análisis sobre cómo surgió la brecha entre la paridad fijada por el Banco Central de Bolivia y las referencias informales en el mercado P2P y fintech.',
    category: 'Economía',
    date: '02 de Febrero, 2025',
    readTime: '6 min de lectura',
    author: 'Redacción DólarBolivia',
    content: `
### El origen de la paridad fija

Desde noviembre de 2011, el Banco Central de Bolivia (BCB) mantuvo el tipo de cambio oficial congelado en **6.96 BOB para la venta y 6.86 BOB para la compra** por cada dólar estadounidense. Durante más de una década, este esquema funcionó sostenido por reservas internacionales cuantiosas provenientes de las exportaciones de hidrocarburos.

Sin embargo, los cambios en la balanza comercial y la reducción paulatina de reservas de divisas crearon una discrepancia entre la oferta de dólares al precio oficial y la demanda real de la población e importadores.

---

### ¿Qué es el dólar paralelo o "dólar blue"?

En el contexto boliviano, el dólar paralelo (a menudo llamado dólar blue o dólar P2P) representa la tasa de cambio resultante de la **libre oferta y demanda** entre particulares, fuera del circuito bancario comercial regulado.

Debido a que las entidades financieras tradicionales limitaron la entrega de dólares físicos en ventanilla y restringieron los montos diarios para pagos internacionales con tarjetas de débito y crédito, el mercado migró de manera natural hacia plataformas digitales y P2P.

---

### Cuadro Comparativo de Características

| Característica | Dólar Oficial (BCB) | Dólar Paralelo / P2P |
| :--- | :--- | :--- |
| **Valor de Referencia** | 6.96 BOB / USD | Dinámico (ej. 10.50 - 10.85 BOB) |
| **Disponibilidad** | Restringida / Asignación prioritaria | Alta disponibilidad en USDT y efectivo |
| **Determinación** | Política Monetaria Estatal | Libre Oferta y Demanda P2P |
| **Canal habitual** | Ventanillas bancarias / Comex regulado | Binance, Bybit, Airtm, Casas de cambio |

---

### ¿Por qué se utiliza el dólar USDT como estándar?

En la era digital, la criptomoneda estable **Tether (USDT)** —cuyo valor está respaldado 1:1 con el dólar estadounidense— se ha convertido en el vehículo preferido de liquidación rápida en Bolivia. Permite a importadores, profesionales independientes y ahorristas transferir valor de manera inmediata sin depender de la corresponsalía bancaria internacional tradicional.

Por esta razón, la cotización P2P del USDT es hoy la referencia técnica más confiable para seguir la evolución del dólar paralelo en Bolivia en tiempo real.
    `,
  },
];
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}