<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Inicio de Sesión</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #0A0E27 0%, #13172E 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0A0E27 0%, #13172E 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(26,31,77,0.9); border-radius: 20px; overflow: hidden; box-shadow: 0 0 40px rgba(0,240,255,0.2);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #00F0FF, #5FF4FF); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #0A0E27; font-size: 2rem; font-weight: 800;">🦅 EAGLEINVEST</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: white; margin: 0 0 20px; font-size: 1.5rem;">Hola {{ $user->name }},</h2>
                            <p style="color: #A1A9C9; font-size: 1rem; line-height: 1.6; margin: 0 0 30px;">
                                Detectamos un nuevo inicio de sesión en tu cuenta de EagleInvest.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.2); border-radius: 12px; margin: 0 0 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="color: #7581A8; margin: 0 0 8px; font-size: 0.85rem;">Fecha y Hora</p>
                                        <p style="color: white; margin: 0; font-weight: 600;">{{ now()->format('d/m/Y H:i:s') }}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 20px 20px;">
                                        <p style="color: #7581A8; margin: 0 0 8px; font-size: 0.85rem;">Dispositivo</p>
                                        <p style="color: white; margin: 0; font-weight: 600;">Navegador Web</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="padding: 20px; background: rgba(12,235,221,0.1); border-left: 4px solid #0CEBDD; border-radius: 8px;">
                                <p style="color: #0CEBDD; margin: 0; font-size: 0.9rem; font-weight: 600;">
                                    ✓ Inicio de sesión exitoso
                                </p>
                                <p style="color: #A1A9C9; margin: 10px 0 0; font-size: 0.85rem;">
                                    Si fuiste tú, puedes ignorar este correo.
                                </p>
                            </div>
                            
                            <div style="margin-top: 20px; padding: 20px; background: rgba(255,0,128,0.1); border-left: 4px solid #FF0080; border-radius: 8px;">
                                <p style="color: #FF0080; margin: 0; font-size: 0.9rem; font-weight: 600;">
                                    ⚠️ ¿No fuiste tú?
                                </p>
                                <p style="color: #A1A9C9; margin: 10px 0 0; font-size: 0.85rem; line-height: 1.5;">
                                    Si no reconoces este inicio de sesión, cambia tu contraseña inmediatamente y contacta con soporte.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background: rgba(13,17,46,0.8); padding: 20px; text-align: center; border-top: 1px solid rgba(0,240,255,0.2);">
                            <p style="color: #7581A8; margin: 0; font-size: 0.85rem;">
                                © 2025 EagleInvest. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
