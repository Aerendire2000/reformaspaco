# Web de Reformas Paco — guía para ponerla en marcha

La web muestra solas las fotos que tu papá publica en Instagram. Cada hora, GitHub (un servicio gratuito) mira si hay publicaciones nuevas, copia las fotos a la web y la vuelve a publicar.

**Coste:** 0 € al mes. Solo se paga el dominio `reformaspaco.com` (unos 10–15 € al año).
**Tiempo de preparación:** alrededor de 1 hora, una sola vez.

Necesitas:
- El Instagram de tu papá convertido en **cuenta profesional** (es gratis).
- Una cuenta en **GitHub** (github.com), donde vivirá la web.
- Una cuenta de **Meta for Developers** (developers.facebook.com), para dar permiso a la web a leer el Instagram.

---

## 1. Preparar el Instagram de tu papá

1. En el móvil de tu papá: **Perfil → ☰ → Tipo de cuenta y herramientas → Cambiar a cuenta profesional**.
2. Elige **Empresa** y una categoría parecida a "Contratista" o "Servicio de reformas".
3. Si está libre, usa un nombre como `@reformaspaco`. Pon en la biografía el teléfono y la web.

No hace falta tener una página de Facebook.

## 2. Cómo publicar para que salga en la web (esto es para tu papá)

Puedes reenviarle esta parte por WhatsApp:

> **Para que tus fotos salgan en la web:**
> - La **primera línea** del texto es el título. Ejemplo: *Baño completo en Puertollano*
> - Debajo puedes explicar el trabajo si quieres.
> - Pon **un hashtag del servicio**:
>   `#albañilería` · `#pladur` · `#soldadura` · `#pintura` · `#electricidad` · `#fontanería` · `#alicatados` · `#reformaintegral`
> - Puedes subir **varias fotos en una publicación** (antes y después): en la web se ven juntas.
> - Si una publicación **no es un trabajo** (una felicitación, por ejemplo), pon `#noweb` y no saldrá en la web.
> - Evita que se vean caras de clientes, matrículas o números de portal.

Detalles:
- Los demás hashtags (#reformas, #puertollano…) no afectan a la web y se quitan del texto.
- Una publicación sin hashtag de servicio sale igual, pero solo en "Todos".
- De los **vídeos y reels** la web muestra la portada con un botón para verlo en Instagram. Si un reel lleva música de la biblioteca de Instagram, Instagram no deja leerlo y no sale.
- Si borra una publicación en Instagram, desaparece de la web en la siguiente hora.

## 3. Subir la web a GitHub

1. Crea una cuenta en **github.com**. Puede ser a nombre de Reformas Paco.
2. Pulsa **New repository**:
   - Nombre: `reformaspaco`
   - Marca **Public**. Es necesario para que GitHub Pages sea gratis. El código se ve, pero las contraseñas van guardadas aparte, en secreto.
   - Pulsa **Create repository**.
3. En la página del repositorio pulsa **uploading an existing file**. Arrastra **todo el contenido** de la carpeta `WEB_REFORMAS_PACO`, incluida la carpeta `.github`, y pulsa **Commit changes**.
4. Comprueba que en el repositorio aparece la carpeta `.github/workflows` con dos archivos.
   - Si no aparece: **Add file → Create new file**, escribe el nombre `.github/workflows/publicar.yml` y pega el contenido del archivo.
   - Repite lo mismo con `renovar-token.yml`.

## 4. Activar la publicación de la web

1. En el repositorio: **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Ve a la pestaña **Actions → Publicar web → Run workflow**.
4. En uno o dos minutos la web estará en `https://TU-USUARIO.github.io/reformaspaco/`.

De momento se verán las fotos de ejemplo. Se sustituyen solas cuando conectes Instagram (paso 5).

## 5. Conectar Instagram (el "token")

1. Entra en **developers.facebook.com** con una cuenta de Facebook y pulsa **My Apps → Create app**.
2. Al elegir el tipo de app, elige **Business** (empresa). Nombre: "Web Reformas Paco".
3. En la app, añade el producto **Instagram** y entra en **API setup with Instagram business login**.
4. Añade la cuenta de Instagram de tu papá y pulsa **Generate token**. Se abrirá Instagram para iniciar sesión y aceptar: hazlo con la cuenta de tu papá.
5. Copia el token, un texto largo. **No se lo pases a nadie.**
6. En GitHub, dentro del repositorio: **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `IG_TOKEN`
   - Secret: pega el token y pulsa **Add secret**.
7. **Actions → Publicar web → Run workflow.** Al terminar, la web ya muestra las fotos de Instagram en lugar de los ejemplos.

> Si la cuenta todavía no tiene publicaciones, la galería saldrá vacía con el mensaje "Pronto subiremos más". Conviene que tu papá suba 5 o 6 trabajos antes de compartir el enlace.

## 6. Renovación automática del permiso

El token de Instagram caduca a los **60 días** si no se renueva. El proceso "Renovar permiso de Instagram" lo renueva cada lunes, pero para guardar el nuevo token necesita un permiso de GitHub:

1. En GitHub, pulsa tu foto (arriba a la derecha) → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Rellénalo así:
   - Nombre: "Renovar Instagram".
   - Caducidad: la fecha más lejana que te deje. Apúntala en el calendario para crear otro antes de que llegue.
   - **Repository access → Only select repositories →** `reformaspaco`.
   - **Repository permissions → Secrets → Read and write.**
3. Pulsa **Generate token** y cópialo.
4. En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `GH_PAT`
   - Secret: pega el token.
5. **Al día siguiente** (Instagram solo deja renovar un token que tenga más de 24 horas): **Actions → Renovar permiso de Instagram → Run workflow**. Si sale en verde, ya está todo automático.

## 7. Poner el dominio reformaspaco.com (comprado en Hostinger)

1. **Verifica el correo** que te mandó Hostinger, pulsando el enlace antes de la fecha que indica. Si no, Hostinger suspende el dominio.
2. **Protege el dominio en GitHub**, antes de conectarlo:
   - Pulsa tu foto (arriba a la derecha) → **Settings → Pages → Add a domain**.
   - Escribe `reformaspaco.com`. GitHub te dará un registro **TXT**.
   - Añádelo en Hostinger (punto 4) y pulsa **Verify** en GitHub.
   - Así nadie más puede usar tu dominio en GitHub.
3. En el repositorio: **Settings → Pages → Custom domain**, escribe `www.reformaspaco.com` y pulsa **Save**.
4. En Hostinger: **hPanel → Dominios → reformaspaco.com → DNS / Nameservers → Registros DNS**.
   - **Borra** los registros que trae de fábrica: el **A** de `@`, el **AAAA** de `@` si lo hay, y el **CNAME** de `www`. Apuntan a la página de "dominio aparcado" de Hostinger.
   - Crea estos registros:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | CNAME | `www` | `TU-USUARIO.github.io` |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

5. Espera a que funcione (de minutos a unas horas) y marca **Enforce HTTPS** en GitHub Pages.

> En Hostinger no hace falta contratar nada más: ni el creador de webs ("Build a business", "Get started"), ni "Domain Shield", ni el hosting. El correo gratuito que ofrecen suele ser una prueba que luego se cobra: revisa el precio antes de activarlo.

## 8. Antes de compartir el enlace

- Rellena los datos que faltan en `aviso-legal.html`, marcados en amarillo: nombre, NIF/NIE, dirección y correo. En España una web de negocio está obligada a tener estos datos.
- Comprueba cómo se ve el enlace en WhatsApp: mándatelo a ti mismo. Debe salir la imagen de `img/compartir.png`. Esto solo funciona con el dominio ya puesto.

## Si algo deja de funcionar

- GitHub envía un correo cuando un proceso falla. Revisa la pestaña **Actions**: el que esté en rojo dice el motivo.
- Si el error habla del token ("Error validating access token", "expired"), repite el **paso 5** para generar uno nuevo y sustituye el secreto `IG_TOKEN`.
- Si quieres que una foto nueva salga ya, sin esperar a la hora siguiente: **Actions → Publicar web → Run workflow**.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `estilos.css`, `app.js` | La web |
| `trabajos.json` | Lista de trabajos de la galería. La rellena el proceso de Instagram; ahora tiene ejemplos |
| `img/` | Logo, imagen para compartir, fotos de ejemplo y, más adelante, las fotos de Instagram (`img/ig/`) |
| `aviso-legal.html` | Aviso legal y privacidad |
| `scripts/actualizar-instagram.mjs` | El programa que lee Instagram y prepara la galería |
| `.github/workflows/` | Los dos procesos automáticos de GitHub |
