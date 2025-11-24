/**
 * @fileoverview Archivo de comentarios y guías de código para EagleInvest
 * @description Este archivo contiene las convenciones y mejores prácticas
 * para el desarrollo del proyecto EagleInvest.
 */

// ============================================================================
// CONVENCIONES DE NOMENCLATURA
// ============================================================================

/**
 * TYPESCRIPT/JAVASCRIPT (Frontend)
 * 
 * 1. CLASES: PascalCase
 *    ✅ class AuthService { }
 *    ✅ class DashboardComponent { }
 *    ❌ class auth_service { }
 * 
 * 2. MÉTODOS Y VARIABLES: camelCase
 *    ✅ getUserData()
 *    ✅ const userName = 'John';
 *    ❌ const user_name = 'John';
 * 
 * 3. CONSTANTES: UPPER_SNAKE_CASE
 *    ✅ const API_URL = 'https://api.example.com';
 *    ✅ const MAX_RETRIES = 3;
 * 
 * 4. INTERFACES: PascalCase (opcionalmente con prefijo I)
 *    ✅ interface User { }
 *    ✅ interface IUserData { }
 * 
 * 5. SIGNALS: camelCase
 *    ✅ const isAuthenticated = signal(false);
 *    ✅ const currentUser = signal<User | null>(null);
 * 
 * 6. OBSERVABLES: sufijo con $
 *    ✅ currentUser$: Observable<User>
 *    ✅ isAuthenticated$: Observable<boolean>
 */

/**
 * PHP/LARAVEL (Backend)
 * 
 * 1. CLASES: PascalCase
 *    ✅ class AuthController { }
 *    ✅ class UserService { }
 * 
 * 2. MÉTODOS: camelCase
 *    ✅ public function getUserData() { }
 *    ✅ private function validateInput() { }
 * 
 * 3. VARIABLES: camelCase (en código), snake_case (en BD)
 *    ✅ $userId = 1;
 *    ✅ $user->first_name (campo BD)
 * 
 * 4. CONSTANTES: UPPER_SNAKE_CASE
 *    ✅ const MAX_LOGIN_ATTEMPTS = 5;
 */

// ============================================================================
// DOCUMENTACIÓN DE CÓDIGO
// ============================================================================

/**
 * JSDOC/TSDOC PARA TYPESCRIPT
 * 
 * Ejemplo completo de documentación de función:
 */

/**
 * Autentica un usuario en el sistema
 * 
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación
 * @throws {HttpErrorResponse} Error HTTP si la autenticación falla
 * 
 * @description
 * Esta función realiza el login del usuario mediante:
 * 1. Validación de credenciales
 * 2. Generación de token JWT
 * 3. Almacenamiento en localStorage
 * 
 * @example
 * ```typescript
 * this.authService.login('user@example.com', 'password').subscribe({
 *   next: (response) => console.log('Login exitoso', response),
 *   error: (error) => console.error('Error en login', error)
 * });
 * ```
 * 
 * @see {@link AuthResponse} para la estructura de la respuesta
 * @see {@link logout} para cerrar sesión
 * 
 * @since 1.0.0
 * @version 1.2.0
 */
function login(email: string, password: string): Observable<AuthResponse> {
  // Implementación...
}

/**
 * PHPDOC PARA PHP
 * 
 * Ejemplo completo de documentación de método:
 */

/**
 * Maneja el inicio de sesión del usuario
 *
 * @param  \Illuminate\Http\Request  $request  Datos de la petición HTTP
 * @return \Illuminate\Http\JsonResponse  Respuesta JSON con resultado
 * 
 * @throws \Illuminate\Validation\ValidationException  Si la validación falla
 * @throws \Illuminate\Auth\AuthenticationException  Si las credenciales son inválidas
 * 
 * @description
 * Este método implementa el flujo completo de autenticación:
 * 1. Valida email y password
 * 2. Verifica credenciales en BD
 * 3. Genera código 2FA de 6 dígitos
 * 4. Almacena código en cache (10 min)
 * 5. Envía código por email
 * 6. Retorna token temporal
 * 
 * @apiParam {string} email Email del usuario (requerido)
 * @apiParam {string} password Contraseña (requerido)
 * 
 * @apiSuccess {boolean} success Indica si la operación fue exitosa
 * @apiSuccess {boolean} requires_2fa Siempre true
 * @apiSuccess {string} temp_token Token temporal para 2FA
 * @apiSuccess {string} message Mensaje descriptivo
 * 
 * @apiError (401) {boolean} success false
 * @apiError (401) {string} message "Credenciales inválidas"
 * 
 * @example
 * // Request:
 * POST /api/auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * // Response:
 * {
 *   "success": true,
 *   "requires_2fa": true,
 *   "temp_token": "abc123xyz",
 *   "message": "Código enviado a tu correo"
 * }
 * 
 * @see verify2FACode() Para completar la autenticación
 * @see resend2FACode() Para reenviar el código
 * 
 * @since 1.0.0
 * @version 1.2.0
 */
public function login(Request $request): JsonResponse
{
    // Implementación...
}

// ============================================================================
// COMENTARIOS INLINE
// ============================================================================

/**
 * BUENOS COMENTARIOS:
 * - Explican el "por qué", no el "qué"
 * - Documentan decisiones de diseño complejas
 * - Advierten sobre side effects
 * - Referencian tickets/issues
 * - Marcan TODOs con contexto
 */

// ✅ BUEN EJEMPLO:
// Usamos cache de 10 minutos para códigos 2FA por seguridad.
// Si el tiempo es mayor, aumenta el riesgo de ataques de fuerza bruta.
// Si es menor, puede expirar antes que el usuario revise su email.
Cache::put("2fa_code_{$userId}", $code, 600);

// ❌ MAL EJEMPLO:
// Guardamos el código en cache
Cache::put("2fa_code_{$userId}", $code, 600);

// ✅ BUEN EJEMPLO:
// FIXME: Este cálculo puede fallar con timezone UTC+14 (Issue #123)
// TODO: Implementar manejo de zonas horarias según preferencia del usuario
const userTimestamp = new Date().getTime();

// ❌ MAL EJEMPLO:
// TODO: fix this
const userTimestamp = new Date().getTime();

/**
 * COMENTARIOS ESPECIALES:
 * 
 * @todo Tarea pendiente
 * @fixme Bug conocido que requiere atención
 * @deprecated Código obsoleto, usar alternativa
 * @note Información importante
 * @warning Advertencia sobre uso incorrecto
 * @hack Solución temporal que necesita refactoring
 */

// ✅ EJEMPLOS:

// @todo Implementar paginación cuando haya más de 100 registros
// @author Carlos Vargas <carlos@example.com>
// @since 1.0.0
function getTransactions() {
  // ...
}

// @deprecated Usar getPortfolioV2() en su lugar. Será removido en v2.0.0
// @see getPortfolioV2()
function getPortfolio() {
  // ...
}

// @hack Workaround temporal para bug en librería externa
// Issue reportado: https://github.com/lib/issue/456
// Remover cuando se actualice a v3.0.0
const tempFix = someLibrary.workaround();

// ============================================================================
// ESTRUCTURA DE ARCHIVOS
// ============================================================================

/**
 * ORDEN RECOMENDADO EN COMPONENTES ANGULAR:
 * 
 * 1. Imports
 * 2. Decorador @Component
 * 3. Propiedades de clase
 *    - Constantes
 *    - Signals
 *    - Observables
 *    - Servicios inyectados
 * 4. Constructor
 * 5. Lifecycle hooks (ngOnInit, ngOnDestroy, etc.)
 * 6. Métodos públicos
 * 7. Métodos privados
 * 8. Getters y setters
 */

// ✅ EJEMPLO:

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule]
})
export class ExampleComponent {
  // 1. Constantes
  private readonly API_URL = 'http://localhost:8000/api';
  
  // 2. Signals
  isLoading = signal(false);
  data = signal<Data[]>([]);
  
  // 3. Observables
  data$: Observable<Data[]>;
  
  // 4. Servicios
  private dataService = inject(DataService);
  
  // 5. Constructor (si es necesario)
  constructor() {
    // Inicialización básica
  }
  
  // 6. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    // Cleanup
  }
  
  // 7. Métodos públicos
  public loadData(): void {
    // ...
  }
  
  // 8. Métodos privados
  private processData(data: Data[]): Data[] {
    // ...
  }
  
  // 9. Getters/Setters
  get formattedData(): string {
    return this.data().join(', ');
  }
}

/**
 * ORDEN RECOMENDADO EN CONTROLADORES LARAVEL:
 * 
 * 1. Propiedades de clase
 * 2. Constructor con inyección de dependencias
 * 3. Métodos HTTP principales (index, show, store, update, destroy)
 * 4. Métodos auxiliares públicos
 * 5. Métodos privados
 */

// ✅ EJEMPLO:

class ExampleController extends Controller
{
    // 1. Propiedades
    private UserService $userService;
    
    // 2. Constructor
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    
    // 3. Métodos HTTP principales
    public function index(Request $request): JsonResponse
    {
        // ...
    }
    
    public function store(Request $request): JsonResponse
    {
        // ...
    }
    
    // 4. Métodos auxiliares públicos
    public function getStats($userId): array
    {
        // ...
    }
    
    // 5. Métodos privados
    private function validateData(array $data): bool
    {
        // ...
    }
}

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

/**
 * FRONTEND (TypeScript)
 */

// ✅ Manejo completo de errores en Observable
this.authService.login(email, password).subscribe({
  next: (response) => {
    console.log('Login exitoso', response);
    this.router.navigate(['/dashboard']);
  },
  error: (error: HttpErrorResponse) => {
    console.error('Error en login:', error);
    
    // Manejo específico por código de error
    if (error.status === 401) {
      this.errorMessage = 'Credenciales inválidas';
    } else if (error.status === 500) {
      this.errorMessage = 'Error del servidor. Intenta más tarde.';
    } else {
      this.errorMessage = 'Error desconocido';
    }
    
    // Mostrar notificación al usuario
    this.notificationService.error(this.errorMessage);
  },
  complete: () => {
    console.log('Petición completada');
    this.isLoading.set(false);
  }
});

/**
 * BACKEND (PHP)
 */

// ✅ Manejo completo de errores en Controller
public function store(Request $request): JsonResponse
{
    try {
        // Validación
        $validated = $request->validate([
            'email' => 'required|email',
            'amount' => 'required|numeric|min:0'
        ]);
        
        // Lógica de negocio
        $result = $this->service->process($validated);
        
        return response()->json([
            'success' => true,
            'data' => $result
        ], 200);
        
    } catch (ValidationException $e) {
        // Error de validación
        return response()->json([
            'success' => false,
            'message' => 'Datos inválidos',
            'errors' => $e->errors()
        ], 422);
        
    } catch (ModelNotFoundException $e) {
        // Recurso no encontrado
        return response()->json([
            'success' => false,
            'message' => 'Recurso no encontrado'
        ], 404);
        
    } catch (\Exception $e) {
        // Error general
        Log::error('Error en store:', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error interno del servidor'
        ], 500);
    }
}

// ============================================================================
// VALIDACIÓN DE DATOS
// ============================================================================

/**
 * FRONTEND (Angular)
 */

// ✅ Validación en formulario reactivo
import { FormBuilder, Validators } from '@angular/forms';

loginForm = this.fb.group({
  email: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(255)
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100)
  ]]
});

// Validador custom
passwordMatch(group: FormGroup) {
  const password = group.get('password')?.value;
  const confirm = group.get('password_confirmation')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

/**
 * BACKEND (Laravel)
 */

// ✅ Validación con Request
$request->validate([
    'email' => 'required|email|max:255|unique:users',
    'password' => [
        'required',
        'string',
        'min:8',
        'confirmed',
        'regex:/[a-z]/',      // Al menos una minúscula
        'regex:/[A-Z]/',      // Al menos una mayúscula
        'regex:/[0-9]/',      // Al menos un número
        'regex:/[@$!%*#?&]/', // Al menos un carácter especial
    ],
    'amount' => 'required|numeric|min:0|max:999999.99',
    'user_id' => 'required|exists:users,id'
]);

// ✅ Mensajes de validación personalizados
$request->validate([
    'email' => 'required|email'
], [
    'email.required' => 'El email es obligatorio',
    'email.email' => 'El formato del email es inválido'
]);

// ============================================================================
// TESTING
// ============================================================================

/**
 * FRONTEND (Jasmine/Karma)
 */

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should login user successfully', () => {
    const mockResponse = {
      success: true,
      token: 'abc123',
      user: { id: 1, email: 'test@test.com' }
    };
    
    service.login('test@test.com', 'password').subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.token).toBe('abc123');
    });
    
    const req = httpMock.expectOne(`${service.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});

/**
 * BACKEND (PHPUnit)
 */

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@test.com',
            'password' => bcrypt('password123')
        ]);
        
        // Act
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@test.com',
            'password' => 'password123'
        ]);
        
        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'requires_2fa',
                     'temp_token',
                     'message'
                 ]);
    }
    
    /** @test */
    public function login_fails_with_invalid_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@test.com',
            'password' => 'wrongpassword'
        ]);
        
        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Credenciales inválidas'
                 ]);
    }
}

// ============================================================================
// SEGURIDAD
// ============================================================================

/**
 * CHECKLIST DE SEGURIDAD
 */

// ✅ Nunca guardar contraseñas en texto plano
// ❌ $user->password = $request->password;
// ✅ $user->password = bcrypt($request->password);

// ✅ Sanitizar inputs
// ✅ $cleanInput = strip_tags($request->input);
// ✅ $safeHtml = htmlspecialchars($input);

// ✅ Validar siempre en backend (nunca confiar solo en frontend)

// ✅ Usar prepared statements (Eloquent lo hace automáticamente)
// ❌ DB::select("SELECT * FROM users WHERE id = " . $id);
// ✅ DB::select("SELECT * FROM users WHERE id = ?", [$id]);
// ✅ User::where('id', $id)->first();

// ✅ Proteger rutas con middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
});

// ✅ Rate limiting
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ✅ CORS configurado correctamente
'allowed_origins' => ['https://tudominio.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],

// ============================================================================
// PERFORMANCE
// ============================================================================

/**
 * OPTIMIZACIONES COMUNES
 */

// ✅ Usar cache para datos que no cambian frecuentemente
$cryptoPrices = Cache::remember('crypto_prices', 60, function () {
    return $this->fetchCryptoPrices();
});

// ✅ Eager loading para evitar N+1 queries
// ❌ $users = User::all(); foreach($users as $user) { $user->investments; }
// ✅ $users = User::with('investments')->get();

// ✅ Paginación para grandes datasets
// ❌ $transactions = Transaction::all();
// ✅ $transactions = Transaction::paginate(50);

// ✅ Índices en columnas frecuentemente consultadas
Schema::create('users', function (Blueprint $table) {
    $table->index('email');
    $table->index(['created_at', 'status']);
});

// ✅ OnPush change detection en Angular
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// ✅ TrackBy en *ngFor
<div *ngFor="let item of items; trackBy: trackByFn">

trackByFn(index: number, item: any): any {
  return item.id;
}

// ============================================================================
// FIN DEL ARCHIVO
// ============================================================================
