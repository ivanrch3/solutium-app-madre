# Plantillas de Correo Profesional para Solutium (Colores Actualizados)

Copia y pega este código HTML en tu panel de **Supabase** en la sección:
`Authentication > Email Templates`

**Paleta de Colores Aplicada:**
- **Cabecera (Purple):** `#700AB1`
- **Botones (Green):** `#005e79`

---

## 1. Confirmación de Registro (Confirm Signup)
**Asunto:** Bienvenido a Solutium - Confirma tu cuenta

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Solutium</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f2f4f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #700AB1; padding: 40px; text-align: center; }
    .content { padding: 40px; color: #2c2f3a; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 14px 32px; background-color: #005e79; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .logo { height: 40px; margin-bottom: 10px; }
    h1 { font-size: 24px; margin-top: 0; color: #2c2f3a; }
    p { margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://solutium.app/solutium-imagotipo-blanco.png" alt="Solutium" class="logo">
    </div>
    <div class="content">
      <h1>¡Hola! Bienvenido a Solutium</h1>
      <p>Estamos emocionados de tenerte a bordo. Solutium es tu nueva plataforma centralizada para gestionar todo tu ecosistema digital de negocios.</p>
      <p>Para comenzar a utilizar tu cuenta y acceder a todas las herramientas, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirmar mi cuenta</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">Si no creaste esta cuenta, puedes ignorar este correo con seguridad.</p>
    </div>
    <div class="footer">
      &copy; 2026 Solutium | Digital Business Platform<br>
      Este es un correo automático, por favor no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
```

---

## 2. Restablecer Contraseña (Reset Password)
**Asunto:** Restablecer tu contraseña de Solutium

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f2f4f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #700AB1; padding: 40px; text-align: center; }
    .content { padding: 40px; color: #2c2f3a; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 14px 32px; background-color: #005e79; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .logo { height: 40px; margin-bottom: 10px; }
    h1 { font-size: 24px; margin-top: 0; color: #2c2f3a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://solutium.app/solutium-imagotipo-blanco.png" alt="Solutium" class="logo">
    </div>
    <div class="content">
      <h1>Restablecer Contraseña</h1>
      <p>Has solicitado restablecer la contraseña de tu cuenta en Solutium.</p>
      <p>Haz clic en el botón de abajo para elegir una nueva contraseña. Este enlace expirará pronto por razones de seguridad.</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Cambiar mi contraseña</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">Si no solicitaste este cambio, puedes ignorar este correo; tu contraseña actual seguirá funcionando correctamente.</p>
    </div>
    <div class="footer">
      &copy; 2026 Solutium | Digital Business Platform<br>
      Este es un correo automático, por favor no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
```

---

## 3. Enlace Mágico (Magic Link)
**Asunto:** Tu enlace de acceso a Solutium

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Rápido</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f2f4f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #700AB1; padding: 40px; text-align: center; }
    .content { padding: 40px; color: #2c2f3a; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 14px 32px; background-color: #005e79; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .logo { height: 40px; margin-bottom: 10px; }
    h1 { font-size: 24px; margin-top: 0; color: #2c2f3a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://solutium.app/solutium-imagotipo-blanco.png" alt="Solutium" class="logo">
    </div>
    <div class="content">
      <h1>Acceso a Solutium</h1>
      <p>Utiliza el siguiente enlace para iniciar sesión en tu cuenta de Solutium de forma segura y sin contraseña.</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Entrar a Solutium</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">Este enlace es de un solo uso y expirará en unos minutos.</p>
    </div>
    <div class="footer">
      &copy; 2026 Solutium | Digital Business Platform<br>
      Si no solicitaste este enlace, simplemente ignora este correo.
    </div>
  </div>
</body>
</html>
```

---

## 4. Invitación al Equipo (User Invitation)
**Asunto:** Has sido invitado a unirte a un equipo en Solutium

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación al Equipo</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f2f4f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #700AB1; padding: 40px; text-align: center; }
    .content { padding: 40px; color: #2c2f3a; line-height: 1.6; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 14px 32px; background-color: #005e79; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .logo { height: 40px; margin-bottom: 10px; }
    h1 { font-size: 24px; margin-top: 0; color: #2c2f3a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://solutium.app/solutium-imagotipo-blanco.png" alt="Solutium" class="logo">
    </div>
    <div class="content">
      <h1>¡Te han invitado a Solutium!</h1>
      <p>Un miembro de tu equipo te ha invitado a colaborar en Solutium, la plataforma digital para la gestión integral de negocios.</p>
      <p>Al unirte, podrás acceder a las herramientas compartidas, proyectos y activos digitales de tu organización de forma centralizada.</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Aceptar Invitación</a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">Si ya tienes una cuenta, simplemente inicia sesión después de hacer clic. Si no, podrás crear una nueva cuenta rápidamente.</p>
    </div>
    <div class="footer">
      &copy; 2026 Solutium | Digital Business Platform<br>
      Este es un correo automático de invitación.
    </div>
  </div>
</body>
</html>
```

