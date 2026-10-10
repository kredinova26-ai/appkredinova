# AppKredinova

Préstamos con cobros semanales, catorcenales, quincenales, diarios y mensuales.

- **Base de datos:** una hoja de Google Sheets.
- **Servidor (API):** Google Apps Script, pegado dentro de esa hoja.
- **App web:** archivos estáticos publicados en Netlify.

```
AppKredinova/
├── netlify.toml        → le dice a Netlify que publique la carpeta web/
├── web/                → lo que se publica en Netlify
│   ├── index.html      → la app completa en un solo archivo (incluye la URL de tu API)
│   ├── sw.js           → permite abrir la app sin internet (opcional)
├── netlify/edge-functions/api.js → puente seguro hacia Apps Script (usa la variable KREDINOVA_API)
│   └── _headers        → cabeceras de seguridad para Netlify
└── apps-script/        → se pega en Google Apps Script (no se publica)
    ├── Code.gs         → API, permisos y reglas del crédito
    ├── Datos.gs        → datos iniciales de tu Excel
    └── appsscript.json → configuración de la implementación
```

## 1. Base de datos y API en Google

> **Atajo:** sube `AppKredinova_BaseDatos.xlsx` a Google Drive y elige **Archivo → Guardar como hoja de cálculo de Google**. Ya trae todas las tablas, los campos y tus datos, así que en el paso 1 usas esa hoja y en el paso 4 puedes omitir `Datos.gs`. La contraseña temporal de `admin` aparece en la pestaña Instrucciones.

1. Crea una hoja nueva en Google Sheets, por ejemplo "AppKredinova – Base de datos".
2. Abre **Extensiones → Apps Script**.
3. Pega `apps-script/Code.gs` en el archivo `Código.gs`.
4. Pulsa **+ → Secuencia de comandos**, ponle de nombre `Datos` y pega `apps-script/Datos.gs`.
5. En **⚙️ Configuración del proyecto**, activa *Mostrar el archivo de manifiesto "appsscript.json"*. Después reemplaza su contenido con `apps-script/appsscript.json`.
6. Arriba, elige la función **`instalar`** y pulsa **▶ Ejecutar**. Acepta los permisos.
   - Se crean las pestañas y se cargan tus datos.
   - En el **Registro de ejecución** aparece: `Usuario: admin · Contraseña temporal: Kredi####nova`. **Anótala.**
7. Pulsa **Implementar → Nueva implementación → ⚙️ Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
8. Copia la **URL de la aplicación web**. Termina en `/exec`.

> No compartas la hoja con nadie. La app accede a ella a través de la API, que revisa usuario, contraseña y rol en cada acción.

## 2. Conectar la app con la API

Abre `web/index.html` con el Bloc de notas y busca la línea `window.KREDINOVA_API`, casi al inicio del archivo. Pega ahí tu URL `/exec` y guarda. Toda la app está en ese único archivo.

## 3. Publicar en Netlify

**Opción A, desde un repositorio de GitHub (recomendada):**
1. Sube la carpeta `AppKredinova` a un repositorio de GitHub.
2. En Netlify, pulsa **Add new site → Import an existing project** y elige el repositorio.
3. Deja vacío el comando de compilación. Netlify lee `netlify.toml` y publica la carpeta `web/`.
4. Cada vez que hagas *push*, Netlify vuelve a publicar.

**Opción B, arrastrar y soltar:**
Entra a <https://app.netlify.com/drop> y arrastra la carpeta **`web`**, no la carpeta raíz.

## 4. Primer ingreso

1. Abre tu sitio de Netlify y entra con `admin` y la contraseña temporal.
2. La app te pedirá crear una contraseña nueva.
3. En **Usuarios**, crea a tus supervisores, cobradores y usuarios de consulta. Cada uno recibe una contraseña temporal que deberá cambiar al entrar.

En el celular, abre el sitio y elige **Añadir a pantalla de inicio** para usarla como una app.

## Cambios en el código

- **Si cambias `Code.gs`:** en **Implementar → Gestionar implementaciones**, pulsa ✏️ en la implementación, elige **Versión: nueva** y pulsa Implementar. Así la URL sigue siendo la misma.
- **Si cambias la app web:** sube los cambios a GitHub, o arrastra de nuevo la carpeta `web`.

## Flujo de crédito: de la solicitud al desembolso

Todo préstamo nace de una **solicitud**, que avanza en 4 pasos. Cada paso tiene su documento para imprimir y firmar.

1. **Solicitud de crédito.** Recoge todos los datos del formato:
   - Datos del crédito, del cliente y del cónyuge.
   - Negocio o trabajo y dos referencias.
   - Análisis de ventas por día y datos del fiador.
   - Autorización de consulta al buró.

   La app muestra qué falta. **Solo se imprime cuando está completa y guardada.**
2. **Aprobación y plan de pagos.** Un Supervisor o Administrador compara el crédito anterior, la propuesta y la aprobación, y fija las condiciones. Con eso se genera e imprime el **plan de pagos**.
3. **Garantías.** Se registran hasta 16 bienes con su detalle, marca, modelo, serie, color, valor y ubicación (domicilio o negocio), y se acepta la declaración de propiedad.
   - El total debe cubrir el porcentaje mínimo que fijes en Ajustes (100 % por defecto).
   - El formato de garantías se imprime cuando está completo.
4. **Verificación y desembolso.** Se llena la hoja de verificación:
   - Cliente, negocio o empleo, y garantías, cada punto con Sí/No.
   - Verificación zonal, referencias vecinales y zona de riesgo.
   - Visto bueno del gerente.

   La hoja se **envía a autorización**. Un usuario con el permiso **"Autorizar desembolsos (visto bueno)"** (por defecto Administrador y Supervisor) recibe el aviso en el Inicio, en el menú de Solicitudes y con un mensaje al entrar. Puede tomar tres acciones:
   - **Autorizar**, con observaciones.
   - **Devolver para corregir**, explicando qué falta.
   - **Denegar.**

   Quien envió la verificación no puede autorizarla él mismo, salvo el usuario principal.

   **Autorizador único:** en **Ajustes → Solicitudes de crédito → Autorizador de desembolsos** se puede designar a **un solo usuario con rol Administrador**, normalmente el gerente de sucursal. Desde ese momento solo él puede autorizar o devolver, y solo él recibe los avisos. Si deja de ser administrador o se desactiva, nadie puede autorizar hasta que se designe a otro. Con la opción *Sin delegar*, autoriza cualquier usuario con el permiso. Con el visto bueno se **desembolsa**, y ahí se crea el préstamo. Si el cliente tiene un préstamo activo, se hace como represtamo. También se puede **denegar**, explicando las razones. Al final se imprime la hoja de desembolso.

**Formato de cédula y teléfono:** todos los campos de cédula se escriben con máscara `000-000000-0000A` y todos los de teléfono o celular con `0000-0000`. La app pone los guiones y las mayúsculas sola, y marca en rojo un dato incompleto. El servidor también lo normaliza y lo valida. Al ejecutar `instalar`, o la función `normalizarContactos`, los teléfonos y cédulas ya guardados se pasan al mismo formato.

**Cliente existente o nuevo:** en la solicitud puedes buscar al cliente por nombre, cédula o teléfono, y sus datos se llenan solos. Si es nuevo, eliges **Cliente nuevo** y llenas los campos. Departamento y municipio se eligen de listas relacionadas, con los 153 municipios de Nicaragua.

**Cónyuge:** si el cliente es casado o vive en unión libre, la app exige la **cédula, los nombres, los apellidos y el celular** del cónyuge, tanto en la ficha del cliente como en la solicitud. El servidor también lo valida.

**Bloqueos por incumplimiento:**
- **Cliente con préstamo activo que no cumple los requisitos de represtamo** (por días de atraso o por el porcentaje mínimo de cuotas pagadas): no puede tramitar una solicitud nueva, ni se le puede aprobar o desembolsar una que ya esté en curso.
- **Verificación con algún punto marcado como "No":** el crédito no se puede desembolsar. Hay que corregir la información o denegar la solicitud.

El servidor aplica las mismas reglas.

Los estados de una solicitud son: BORRADOR → COMPLETA → APROBADA → DESEMBOLSADA, o DENEGADA. Todo queda en la pestaña **Solicitudes** de la hoja y en la Auditoría.

## Préstamos nuevos y represtamos

- **Préstamo nuevo:** solo se puede otorgar a clientes **sin un préstamo activo**, es decir, sin deuda pendiente. El servidor lo valida. Si alguien lo intenta igual, la acción se rechaza y queda registrada como DENEGADO en la Auditoría.
- **Represtamo:** es la alternativa para un cliente que todavía tiene un préstamo activo.
  - **Cómo funciona:** el préstamo nuevo liquida el saldo pendiente del anterior, y al cliente solo se le entrega la diferencia en efectivo.
  - **Pago de liquidación:** se genera solo, con su recibo, y el concepto es "CANCELACION POR REPRESTAMO".
  - **Quién puede otorgarlo:** solo Supervisor y Administrador.
  - **Requisitos:** se configuran en **Ajustes**. Por defecto, el cliente debe haber pagado al menos el **50 %** de las cuotas y tener **0 días** de atraso.
  - **Mora pendiente:** se puede perdonar al liquidar, si el usuario tiene ese permiso.
  - **Si se elimina un represtamo:** el préstamo anterior vuelve a quedar activo exactamente como estaba.

## Clasificación de los pagos

Cada pago se clasifica solo, según lo que el cliente debía en ese momento. La referencia son las cuotas vencidas más la cuota del día más la mora; si no debía nada, la próxima cuota.

| Pago | Concepto |
|---|---|
| Menor que la referencia | **Abono a cuota** |
| Igual a la referencia, o hasta C$ 1 más por redondeo | **Pago de cuota** |
| Mayor, sin liquidar todo | **Pago anticipado** |
| Liquida toda la deuda | **Cancelación de crédito** |

El redondeo se ajusta en Ajustes. El tipo de pago se ve antes de guardar, en el recibo y en el historial de pagos.

## Cobros sin conexión a internet

Si el cobrador está en un lugar sin señal, igual puede registrar el cobro:

1. **Al guardar el pago sin conexión**, la app ofrece guardarlo en el dispositivo y entrega un **comprobante provisional** con un código único (ej. `OFF-PEDRO-…`). Se puede imprimir o enviar por WhatsApp.
2. **Mientras no haya señal**, el préstamo muestra el saldo ya descontado. Una barra superior indica cuántos cobros faltan por enviar.
3. **Al volver la señal**, los cobros se envían solos. También se pueden enviar con **Sincronizar**. El servidor asigna el **número de recibo oficial** y respeta la fecha real del cobro, para calcular bien la mora.
4. **Sin duplicados:** cada cobro lleva su código único. Si se envía dos veces por una conexión inestable, el servidor lo registra una sola vez.
5. **Si el servidor rechaza un cobro**, por ejemplo porque otro cobrador ya cobró esa deuda, queda marcado como **Rechazado** en *Cobros sin enviar*, con el motivo, para revisarlo o descartarlo.

**Para abrir la app sin internet** hay que haberla abierto antes con señal, en el mismo dispositivo y navegador. Esto requiere el archivo `sw.js` junto a `index.html` en Netlify. Los datos que se ven sin conexión son los de la última vez que hubo señal.

> No borres los datos del navegador mientras haya cobros pendientes: se perderían los que no se han enviado.

**Números de recibo:** el servidor los asigna dentro de un bloqueo exclusivo (`LockService`), uno a la vez. Aunque varios cobradores guarden pagos al mismo instante, nunca se repiten. Si dos llegan juntos, uno espera unos segundos su turno.

## Recibos de pago

- **Cada pago genera un recibo** con número consecutivo. Lo asigna el servidor, así que nunca se repite aunque cobren varios usuarios a la vez.
- **Contenido del recibo:**
  - Fecha y hora, transacción, préstamo y cliente.
  - Cuota del día, monto atrasado, días de mora, interés moratorio, total a pagar y monto de cancelación.
  - Total cobrado, concepto, saldo anterior, nuevo saldo y firma del cobrador.
- **Opciones al guardar el pago:** el recibo se abre solo. Desde ahí puedes:
  - Imprimirlo en una impresora térmica de **58 mm o 80 mm**.
  - Enviarlo por **WhatsApp** al teléfono del cliente.
- **Reimpresión:** desde el historial de pagos del préstamo. La copia lleva la marca "REIMPRESIÓN" y los pagos anulados salen marcados como "ANULADO".
- **Encabezado:** nombre del negocio, sucursal, teléfono, RUC y mensaje final. Se configuran en **Ajustes del recibo** (solo Administrador) y se guardan en la pestaña **Config**.
- **Impresoras Bluetooth en Android:** instala una app de servicio de impresión, por ejemplo *RawBT*. Después, al pulsar **Imprimir recibo**, elige esa impresora en el cuadro de impresión.
- **Auditoría:** cada impresión, reimpresión y envío por WhatsApp queda registrado.

## Gestión de cobro

La pantalla **Gestión de cobro** está en el menú, en la Agenda de cobros y en Reportes. Reúne a **todos los clientes atrasados** con lo necesario para cobrar:

- **Filtros:**
  - Días de atraso: todos, más de 7, 30, 60 o 90.
  - Ruta, gestor y búsqueda por cliente, cédula, teléfono o fiador.
  - "Solo con fiador" y "Solo promesas de pago incumplidas".
- **Indicadores:** casos en mora, capital en riesgo, vencido más mora, promesas incumplidas y casos sin ninguna gestión.
- **Cada caso** muestra:
  - Al cliente, con botones para llamar y enviar WhatsApp con un mensaje de cobro ya redactado, su último pago y sus cuotas vencidas.
  - Al **fiador**, con cédula, parentesco, dirección y teléfono. También tiene botones para llamar y enviar WhatsApp, con un mensaje dirigido al fiador.
  - Al **cónyuge** y las **referencias** de la solicitud.
- **Aviso al fiador:** carta formal para imprimir, con el detalle del atraso y del monto exigible, y espacio para la firma de recibido.
- **Registrar gestión:** llamada, visita, WhatsApp, aviso al fiador, **promesa de pago** (con fecha y monto) u otro, e indicar con quién se habló.
  - Queda el historial completo de gestiones.
  - Si llega la fecha de una promesa sin que el cliente haya pagado, se marca como **incumplida**.
- **Reporte imprimible:** lista de casos con teléfonos del cliente y del fiador, días de atraso, montos y la última gestión o promesa.

Los datos del fiador salen de la solicitud que originó el préstamo. Los préstamos importados del Excel original no tienen esa información. Las gestiones se guardan en la pestaña **Gestiones**. El cobrador ve y gestiona solo sus préstamos asignados.

## Rutas de cobro

En **Rutas** (para Administrador y Supervisor; los cobradores ven las suyas) se organiza el trabajo de campo:

- **Crear una ruta:** nombre, zona o barrios, **cobrador responsable** y **días de visita** (por ejemplo lunes, miércoles y viernes).
- **Agregar clientes:** se buscan por nombre, cédula, barrio o municipio. Primero aparecen los que aún no tienen ruta.
- **Ordenar las visitas:** con las flechas ↑ ↓ se define el orden en que el cobrador visita a cada cliente.
- **Asignar préstamos:** al guardar, los préstamos activos de esos clientes pasan al cobrador de la ruta, que los verá en su agenda.
- **Cambiar de cobrador** (vacaciones, renuncia): al guardar la ruta con otro cobrador, la app ofrece pasarle todos los préstamos activos de la ruta de una vez.
- **Hoja de ruta:** documento para imprimir cada día. Lista a los clientes en orden de visita con la cuota del día, lo atrasado con mora, el total a cobrar y columnas para anotar lo cobrado y la firma.
- **Agenda de cobros:** se filtra por ruta y, al elegir una, muestra a los clientes en el orden de visita.
- **Reportes:** la tabla *Desempeño por ruta* muestra clientes, capital, % de mora, lo que hay por cobrar hoy y lo cobrado en el periodo.
- **Préstamos nuevos:** al desembolsar un préstamo de un cliente que está en una ruta, si no se eligió cobrador, se asigna el de la ruta.

## Simulador de crédito

En **Simulador** (menú lateral, en Solicitudes o en Mi perfil) cualquier usuario escribe:
- El monto, el plazo, el interés y la mora.
- La modalidad y el número de cuotas.
- La fecha de desembolso.
- Opcionalmente, el ingreso mensual del cliente.

Con eso la app calcula la cuota, el interés total, el total a pagar, las fechas del primer y del último pago y la mora por día. Además muestra:
- La **capacidad de pago**: el % del ingreso que representa la cuota.
- Una **comparación** entre todas las modalidades.
- El **plan de pagos**, con los días de cobro y los feriados configurados.

**Nada de lo simulado se guarda.** Se puede imprimir como *Simulación de crédito*, con la aclaración de que no es una aprobación, o pasar los datos a una **nueva solicitud** con un botón.

## Reportes y resúmenes gerenciales

La pantalla **Reportes** está disponible para Administrador, Supervisor y Consulta. Eliges el periodo (hoy, esta semana, este mes, mes anterior, últimos 30 días, este año o personalizado) y muestra:

- **Cartera a hoy:**
  - Capital en la calle, saldo por cobrar y mora acumulada.
  - **PAR1, PAR8, PAR30 y PAR90**, es decir, el % del capital con más de N días de atraso.
  - Antigüedad de la cartera por tramos de atraso.
- **Resultados del periodo:**
  - Colocación: monto, cantidad, nuevos y represtamos, efectivo entregado, por modalidad.
  - Recuperación: capital, interés y mora cobrados, y mora perdonada.
  - **Ingresos**, que son el interés más la mora.
  - **Cumplimiento de cuotas**: lo pagado contra lo que vencía, y el % pagado a tiempo.
- **Tendencia de 6 meses:** colocado contra cobrado.
- **Proyección de cobros:** las próximas 4 semanas, más lo vencido a hoy.
- **Solicitudes:** recibidas, en trámite, desembolsadas, denegadas, tasa de aprobación y motivos de denegación.
- **Desempeño por gestor:** cartera, capital en mora, % de mora, colocado y cobrado.
- **Clientes con más atraso:** con teléfono y gestor.
- **Clientes:** activos, nuevos, recurrentes y por departamento.

El botón **Imprimir resumen** genera el *Resumen gerencial* en una hoja carta.

## Calendario de cobro: días y feriados

En **Ajustes → Calendario de cobro** se configura:

- **Días en que se cobra:** por defecto de lunes a viernes. Se puede agregar el sábado (o cualquier día) con un toque. En cobro **diario**, la cantidad de cuotas por mes se ajusta sola: lunes a viernes son 20 y lunes a sábado son 24.
- **Feriados:** se puede elegir no cobrar en feriados o cobrar igual.
  - **Lista de feriados:** viene con los feriados nacionales de Nicaragua (1 ene, 1 may, 19 jul, 14 y 15 sep, 8 dic, 25 dic).
  - **Semana Santa:** Jueves y Viernes Santo se calculan solos cada año.
  - **Agregar fechas:** una por línea, `MM-DD Nombre` para todos los años o `AAAA-MM-DD Nombre` para una sola vez, por ejemplo las fiestas patronales de tu municipio.

**Cómo se aplica:**
- En cobro **diario** se saltan los días sin cobro y los feriados.
- En **semanal, catorcenal, quincenal y mensual**, si una cuota cae en un día sin cobro o en feriado, pasa al siguiente día de cobro.
- Los cambios aplican a los planes que se generen desde ese momento. Los préstamos ya desembolsados conservan sus fechas.

## Logos personalizables

En **Ajustes → Logos**, el Administrador puede cambiar dos logos:
- **Logo completo:** se usa en el inicio de sesión y en el menú.
- **Ícono:** se usa en recibos, documentos impresos y en la pestaña del navegador.

Las imágenes pueden ser PNG, JPG o WEBP, y se reducen de tamaño automáticamente.

**Dónde se guardan:** en el Google Drive del propietario, en la carpeta **AppKredinova - Logos**. En la pestaña Config quedan el ID de cada archivo y una versión. Cada usuario los descarga una sola vez y solo vuelve a hacerlo cuando cambian.

**Restaurar original** envía el archivo actual a la papelera de Drive y vuelve al logo de fábrica.

> Esta función usa el permiso de Google Drive. Después de actualizar `Code.gs` y `appsscript.json`, ejecuta una vez la función `instalar` desde el editor para autorizar el acceso a Drive, y luego publica una versión nueva de la implementación.

## Permisos editables

En **Usuarios**, el Administrador puede ajustar los permisos de dos formas:

- **Por rol:** marca o desmarca cada permiso en la tabla "Permisos por rol" y pulsa **Guardar**. El cambio se aplica de inmediato a todos los usuarios de ese rol. Con **Restablecer predeterminados** vuelve a la tabla original.
- **Por usuario:** con el botón **Permisos** de cada persona eliges, para cada permiso, una de tres opciones:
  - "Según el rol"
  - "Permitir"
  - "Quitar"

  Por ejemplo, puedes dejar que un cobrador específico perdone mora.

**Protecciones para no quedarse sin acceso:**
- El rol Administrador siempre conserva *Gestionar usuarios* y *Ajustes*.
- El usuario principal (`admin`) tiene siempre todos los permisos.
- Nadie puede quitarse a sí mismo el permiso de gestionar usuarios.

**Dónde se guardan:**
- La tabla por rol, en la pestaña Config (clave `permisosRoles`).
- Los permisos de cada usuario, en la columna PermisosPersonalizados de la pestaña Usuarios.

El servidor los aplica en cada acción y todo cambio queda en la Auditoría.

## Auditoría

Cada solicitud que llega a la API deja una fila en la pestaña **Auditoria** de la hoja:

| Columna | Qué guarda |
|---|---|
| ID, FechaHora | Identificador único y fecha y hora (UTC) |
| Usuario, Rol | Quién hizo la acción y con qué rol |
| Accion, Modulo, RegistroID | Qué hizo, en qué parte de la app y sobre qué cliente, préstamo, pago o usuario |
| Resultado | **OK**, **DENEGADO** (sin permiso, contraseña incorrecta, sesión vencida) o **ERROR** |
| Detalle | Descripción legible, por ejemplo "93ab9a5d · C$ 3120.7" |
| ValoresAnteriores, ValoresNuevos | El registro antes y después del cambio, en JSON. Nunca incluye contraseñas |
| Dispositivo, Sesion | Navegador y sistema del equipo, más un identificador corto de la sesión |
| HashIntegridad | Huella SHA-256 encadenada con la fila anterior |

**Qué se registra:**
- Inicios de sesión correctos y fallidos, y cierres de sesión.
- Consultas manuales de la cartera.
- Altas, ediciones y eliminaciones de clientes.
- Préstamos otorgados y asignaciones de cobrador.
- Pagos registrados y anulados, y mora perdonada.
- Gestión de usuarios y contraseñas.
- Exportaciones a CSV y consultas de la propia auditoría.
- Todo intento sin permiso.

La actualización automática de cada minuto no se registra, para no llenar la hoja.

**Protección contra cambios:** las filas están encadenadas. Si alguien edita o borra una fila a mano en la hoja, el botón **Verificar integridad** de la pantalla Auditoría lo detecta e indica en qué fila ocurrió. También puedes ejecutar `verificarAuditoria` desde el editor de Apps Script.

Solo el rol **Administrador** puede consultar la auditoría. Si quieres dárselo a otro rol, cambia `'auditoria.ver'` en `PERMISOS`, dentro de `Code.gs` y de `index.html`.

**Si ya habías instalado una versión anterior:** reemplaza `Code.gs` y publica una versión nueva de la implementación. La pestaña Auditoria se crea sola con la primera acción. La pestaña Bitacora antigua queda como historial.

## Respaldo de la información

En **Mi perfil → Respaldo de información** (o en el menú, en *Administración → Respaldos*), el Administrador puede:

- **Crear un respaldo ahora:** guarda una **copia completa** de la hoja de cálculo, con todas las pestañas, en la carpeta **AppKredinova - Respaldos** de Google Drive. Se le puede agregar una nota, por ejemplo "Antes del cierre de mes".
- **Programar un respaldo automático diario:** se elige la hora y cuántos respaldos conservar. Los más antiguos pasan a la papelera de Drive.
- **Ver los respaldos guardados:** cada uno se puede abrir, descargar en **Excel** o eliminar.
- **Descargar mis datos (JSON):** una copia de los datos que se ven en la app.
- **Restaurar:** la pantalla trae instrucciones. La restauración se hace a mano a propósito, para evitar borrados por error.

> Esta función usa el permiso de *activadores* de Apps Script. Después de actualizar `Code.gs` y `appsscript.json`, ejecuta una vez `instalar` y acepta los permisos.

## Dirección de Apps Script en una variable de Netlify

La dirección de la API **ya no está en el código de la página**. La app llama a `/api`, y un *Edge Function* de Netlify (`netlify/edge-functions/api.js`) reenvía cada petición a Apps Script. La dirección real se lee de la variable de entorno **`KREDINOVA_API`**.

**Configurar la variable**
1. En Netlify, abre tu sitio y ve a **Site configuration → Environment variables → Add a variable**.
2. Escribe la clave `KREDINOVA_API` y, como valor, la URL `/exec` de tu implementación de Apps Script.
3. Guarda los cambios y vuelve a publicar el sitio, en *Deploys → Trigger deploy*.

**Publicar**
Las Edge Functions **no funcionan con "arrastrar y soltar" (Netlify Drop)**. Hay que publicar de una de estas dos formas:
- **GitHub:** sube esta carpeta a un repositorio y conéctalo en *Add new site → Import an existing project*. Netlify lee `netlify.toml` solo.
- **Netlify CLI:** desde esta carpeta, ejecuta `npm i -g netlify-cli`, luego `netlify login`, `netlify link` y `netlify deploy --prod`.

**Cambiar de implementación de Apps Script:** solo hay que cambiar el valor de la variable y volver a publicar. El código no se toca.

**Probar fuera de Netlify** (archivo abierto en el PC): define `window.KREDINOVA_API = 'https://…/exec'` en la consola del navegador antes de iniciar sesión.

## Convertir en app de Android (APK)

La web ya está preparada como **PWA**: tiene `manifest.webmanifest`, íconos en `web/icons/` y el *service worker* `sw.js`. Con eso se genera el APK en **PWABuilder** sin instalar nada:

1. Publica el sitio en Netlify y abre su dirección para confirmar que carga.
2. Entra a **https://www.pwabuilder.com**, pega la dirección de Netlify y pulsa **Start**.
3. Pulsa **Package for stores → Android → Generate Package**.
   - **Package ID:** por ejemplo `ni.kredinova.app`.
   - **App name:** AppKredinova.
   - **Signing key:** *Create new*.
4. Descarga el ZIP. Contiene:
   - El **APK** para instalar directo.
   - El **AAB** para Google Play.
   - El archivo **assetlinks.json**.
   - La **llave de firma**: guárdala, es la que permite publicar actualizaciones.
5. Reemplaza `web/.well-known/assetlinks.json` por el que trae el ZIP y vuelve a publicar. Así la app abre sin la barra de dirección del navegador.
6. Pasa el APK a cada celular, ábrelo y permite *Instalar apps desconocidas*.

Las actualizaciones de la app web llegan solas al APK. Solo hace falta generar otro APK si cambias el nombre o el ícono.

## Rendimiento

- **Caché de la cartera:** las pestañas grandes (Clientes, Prestamos, Cuotas, Pagos y Solicitudes) se guardan en la caché de Apps Script. El inicio de sesión y la carga de datos no leen la hoja si nada cambió. Cualquier cambio renueva la caché automáticamente.
- **Versión de datos:** la actualización automática de cada minuto solo descarga la cartera cuando algo cambió. Si no hubo cambios, el servidor responde "sin cambios" sin enviar datos.
- **Apertura instantánea:** al abrir la app con la sesión activa, se muestran al momento los datos guardados en el dispositivo. Una barra verde fina indica que se están actualizando en segundo plano.
- **Lecturas y escrituras agrupadas:** cada pestaña se lee una sola vez por solicitud y las filas modificadas se escriben en un solo bloque.

## Seguridad

- **Contraseñas:** se guardan como hash SHA-256 con sal (1500 rondas) en la pestaña Usuarios. Nunca se envían a la app.
- **Intentos fallidos:** tras 5 intentos, el usuario queda bloqueado 15 minutos.
- **Sesiones:** la sesión sigue activa **mientras el usuario use la app**, sin importar cuántas horas pase. Se cierra en dos casos:
  - **Cierre nocturno:** si a la hora configurada (22:00 por defecto) la app no se está usando (más de 30 minutos sin uso), la sesión se cierra y al día siguiente hay que volver a entrar.
  - **Inactividad:** después de 6 horas sin uso.

  Las actualizaciones automáticas de la pantalla no cuentan como uso. Se configura en Ajustes → Seguridad.
- **Permisos:** el servidor valida el rol en cada acción. Un cobrador solo ve y cobra sus préstamos asignados.
- **Auditoría:** todas las acciones, incluidos los intentos denegados, quedan en la pestaña Auditoria, con verificación de integridad.
- **Límites:** Apps Script tiene cuotas diarias de uso. Son suficientes para una cartera pequeña o mediana, de cientos de préstamos.
