# Guía de Implementación: Endpoint de Búsqueda Avanzada

## Fecha: 2025-12-11
## Proyecto: Dictionary App - Search API

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis del Contexto Actual](#análisis-del-contexto-actual)
3. [Discrepancias y Decisiones Críticas](#discrepancias-y-decisiones-críticas)
4. [Arquitectura Propuesta](#arquitectura-propuesta)
5. [Especificaciones Técnicas](#especificaciones-técnicas)
6. [Estructura de Archivos](#estructura-de-archivos)
7. [Plan de Implementación Detallado](#plan-de-implementación-detallado)
8. [Checklist de Validación](#checklist-de-validación)
9. [Recursos y Referencias](#recursos-y-referencias)

---

## 1. Resumen Ejecutivo

### Objetivo
Crear un endpoint RESTful de búsqueda avanzada de términos con múltiples filtros, autenticación por API Key, y mejores prácticas de Python para serverless en AWS.

### Alcance
- **Endpoint**: `POST /v1/search` o `GET /v1/search`
- **Autenticación**: API Key via AWS API Gateway
- **Base de Datos**: MongoDB (existente)
- **Infraestructura**: Pulumi (nuevo)
- **Runtime**: Python 3.12 (última versión soportada por AWS Lambda)

---

## 2. Análisis del Contexto Actual

### 2.1 Stack Tecnológico Existente

#### Backend Actual (Node.js/TypeScript)
```
apps/sls-api/
├── src/
│   ├── functions/
│   │   ├── coreApi/          # API principal con Express
│   │   │   ├── controllers/  # Lógica de negocio
│   │   │   ├── schemas/      # Validación con Zod
│   │   │   └── router.ts     # Rutas con @middy/http-router
│   │   └── transactionApi/
│   ├── middlewares/
│   │   ├── authentication.ts # Auth basado en header base64
│   │   ├── logger.ts
│   │   └── body-validator.ts
│   └── utils/
├── serverless.ts             # Serverless Framework config
└── package.json              # Node dependencies
```

#### Tecnologías en Uso
- **Framework**: Serverless Framework v4
- **Runtime**: Node.js 20.x
- **Librerías**:
  - `@middy/core`: Middleware para Lambda
  - `mongodb`: Cliente nativo v6.16.0
  - `zod`: Validación de schemas
  - `@middy/http-router`: Routing HTTP
- **Base de Datos**: MongoDB Atlas (production.h5yse.mongodb.net)
- **Testing**: Vitest
- **Linting/Formatting**: ESLint, Prettier

#### Schema de Base de Datos Actual
```typescript
// Collection: terms
{
  _id: ObjectId,
  srcLanguage: string,      // 'en', 'es', etc.
  toLanguage: string,       // 'es', 'en', etc.
  term: string,             // lowercase
  translation: string,
  types: string[],          // noun, verb, adjective, etc.
  isSentence: boolean,
  pronunciation: {
    phonetic: string,
    nativePhonetic: string,
    nativePhoneticDetails: string
  },
  examples: [{
    sentence: string,
    sentenceNative: string
  }],
  tags: string[],
  dictionary: [{
    type: string,
    baseTerm: string,
    entries: [{
      translation: string,
      reverseTranslation: string[]
    }]
  }],
  level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2',
  audio: Binary,
  image: Binary,
  createdAt: Date,
  updatedAt: Date
}

// Collection: userTerms
{
  _id: ObjectId,
  userId: ObjectId,
  termId: ObjectId,
  tags: string[],
  createdAt: Date
}
```

#### Autenticación Actual
```typescript
// apps/sls-api/src/middlewares/authentication.ts
// Extrae header Authorization (base64)
// Decodifica JSON: { id: string, username: string }
// Almacena en global.dictionary.auth
```

### 2.2 Endpoints Existentes
- `POST /v1/translate` - Traducir texto
- `POST /v1/translate-audio` - Generar audio
- `POST /v1/terms` - Crear término
- `GET /v1/terms` - Listar términos (filtros limitados: tags, page, limit)
- `PATCH /v1/terms/re-build` - Reconstruir términos
- `DELETE /v1/terms/{id}` - Eliminar término
- `GET /v1/tags` - Listar tags
- `GET /v1/health` - Health check

---

## 3. Discrepancias y Decisiones Críticas

### 3.1 Problemas Identificados

#### ❌ CRÍTICO: Stack Mismatch
**Requerimiento**: Python + Pulumi
**Realidad**: Node.js + Serverless Framework

**Implicaciones**:
1. El proyecto actual NO usa Python
2. El proyecto actual NO usa Pulumi
3. Introducir Python crearía un monorepo multi-lenguaje
4. Mantener dos IaC tools (Serverless + Pulumi) es complejo

#### ❌ CRÍTICO: Infraestructura como Código
**Requerimiento**: Pulumi para toda la infraestructura
**Realidad**: Serverless Framework gestiona API Gateway, Lambda, IAM

**Conflictos**:
- Serverless Framework ya define API Gateway y API Keys
- Pulumi y Serverless no colaboran bien juntos
- Riesgo de duplicación de recursos

### 3.2 Decisiones Requeridas del Usuario

**OPCIÓN A: Python Puro (Nuevo Proyecto)**
```
apps/sls-search-python/
├── pulumi/
│   └── __main__.py          # Define Lambda, API Gateway, etc.
├── src/
│   ├── handlers/
│   │   └── search_handler.py
│   ├── services/
│   │   └── mongodb_service.py
│   └── utils/
├── requirements.txt
├── pyproject.toml
└── Pulumi.yaml
```

**Ventajas**:
- Cumple 100% con los requerimientos
- Separación clara de responsabilidades
- Stack homogéneo (Python everywhere)

**Desventajas**:
- Proyecto completamente nuevo
- No reutiliza código TypeScript existente
- Duplicación de lógica de conexión MongoDB
- Mantenimiento de dos stacks diferentes

---

**OPCIÓN B: Híbrido (TypeScript + Pulumi Python)**
```
apps/sls-api/
├── infrastructure/          # NUEVO
│   ├── pulumi/
│   │   ├── __main__.py     # Pulumi en Python
│   │   ├── Pulumi.yaml
│   │   └── requirements.txt
│   └── README.md
├── src/
│   ├── functions/
│   │   ├── coreApi/        # Existente (TS)
│   │   └── searchApi/      # NUEVO (TS)
│   │       ├── handler.ts
│   │       ├── controllers/
│   │       │   └── advancedSearchController.ts
│   │       └── schemas/
│   │           └── searchRequest.ts
└── serverless.ts           # Mantener o migrar a Pulumi
```

**Ventajas**:
- Reutiliza código y conexiones existentes
- Introduce Pulumi gradualmente
- Mantiene consistencia en el lenguaje de negocio (TypeScript)

**Desventajas**:
- No cumple con "Python para Lambda"
- Complejidad de tener Pulumi + Serverless

---

**OPCIÓN C: Migración Completa a Python + Pulumi**
```
apps/sls-search-api/         # Reemplazo de sls-api
├── pulumi/
│   └── __main__.py
├── src/
│   ├── handlers/
│   │   ├── search_handler.py
│   │   ├── terms_handler.py
│   │   └── translate_handler.py
│   ├── services/
│   │   ├── mongodb_service.py
│   │   └── translation_service.py
│   └── middleware/
│       ├── auth.py
│       └── logging.py
└── requirements.txt
```

**Ventajas**:
- Stack completamente moderno
- Cumple con todos los requerimientos
- Oportunidad de refactorizar

**Desventajas**:
- Proyecto de migración masivo
- Riesgo alto
- Tiempo de desarrollo extenso

---

### 3.3 Recomendación Técnica

**🎯 RECOMENDACIÓN: OPCIÓN A (Proyecto Python Independiente)**

**Razones**:
1. **Bajo Riesgo**: No afecta el sistema existente
2. **Cumplimiento**: Satisface todos los requerimientos técnicos
3. **Aprendizaje**: Permite evaluar Python + Pulumi sin commitment total
4. **Escalabilidad**: Si funciona bien, se puede migrar el resto gradualmente

**Próximos Pasos**:
1. Confirmar decisión con stakeholders
2. Definir estrategia de reutilización de MongoDB
3. Establecer plan de migración a largo plazo (si aplica)

---

## 4. Arquitectura Propuesta (Opción A)

### 4.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Gateway (REST API)                    │ │
│  │  - API Key Authentication                              │ │
│  │  - Rate Limiting (10,000 req/day)                      │ │
│  │  - CORS Enabled                                        │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│                   │ POST /v1/search                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Lambda Function (Python 3.12)                  │ │
│  │  - Handler: search_handler.lambda_handler              │ │
│  │  - Memory: 512 MB                                      │ │
│  │  - Timeout: 30s                                        │ │
│  │  - Runtime: python3.12                                 │ │
│  │  - Environment Variables:                              │ │
│  │    * MONGODB_URI                                       │ │
│  │    * MONGODB_DATABASE                                  │ │
│  │    * LOG_LEVEL                                         │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            CloudWatch Logs                             │ │
│  │  - Log Group: /aws/lambda/search-api                   │ │
│  │  - Retention: 7 days                                   │ │
│  │  - Structured JSON Logging                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ MongoDB Driver
                           ▼
                  ┌─────────────────────┐
                  │   MongoDB Atlas     │
                  │  production.h5yse   │
                  │                     │
                  │  Collections:       │
                  │  - terms            │
                  │  - userTerms        │
                  └─────────────────────┘
```

### 4.2 Flujo de Request/Response

```
1. Client Request
   POST /v1/search
   Headers:
     x-api-key: <API_KEY>
     Content-Type: application/json
   Body:
     {
       "userId": "60a3e5b9c7d4e12345678901",
       "filters": {
         "term": "hello",
         "tags": ["vocabulary", "basic"],
         "types": ["noun", "verb"],
         "levels": ["a1", "a2"],
         "languages": {
           "src": "en",
           "to": "es"
         },
         "isSentence": false
       },
       "pagination": {
         "page": 1,
         "limit": 20
       },
       "sort": {
         "field": "createdAt",
         "order": "desc"
       }
     }

2. API Gateway
   - Validate API Key
   - Check Rate Limit
   - Forward to Lambda

3. Lambda Handler
   - Validate request schema (Pydantic)
   - Log request (structured logging)
   - Call SearchService

4. SearchService
   - Connect to MongoDB
   - Build query pipeline
   - Execute aggregation
   - Return results

5. Response
   {
     "success": true,
     "data": {
       "results": [...],
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 150,
         "totalPages": 8
       }
     },
     "metadata": {
       "requestId": "uuid",
       "duration": 123
     }
   }
```

---

## 5. Especificaciones Técnicas

### 5.1 Stack de Python

#### Runtime y Versión
- **Python**: 3.12 (última versión soportada por AWS Lambda)
- **AWS Lambda Runtime**: `python3.12`

#### Dependencias Principales

```toml
# pyproject.toml
[tool.poetry.dependencies]
python = "^3.12"
pymongo = "^4.6.1"              # MongoDB driver oficial
pydantic = "^2.5.3"             # Validación de datos
pydantic-settings = "^2.1.0"    # Gestión de configuración
python-json-logger = "^2.0.7"   # Structured logging
aws-lambda-powertools = "^2.30.0" # AWS utilities

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-cov = "^4.1.0"
pytest-asyncio = "^0.21.1"
black = "^23.12.1"              # Code formatter
ruff = "^0.1.9"                 # Linter ultra rápido
mypy = "^1.8.0"                 # Type checker
pytest-mock = "^3.12.0"
mongomock = "^4.1.2"            # MongoDB mocking

# Pulumi
[tool.poetry.group.infra.dependencies]
pulumi = "^3.100.0"
pulumi-aws = "^6.15.0"
```

#### Alternativa con requirements.txt
```txt
# requirements.txt
pymongo==4.6.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-json-logger==2.0.7
aws-lambda-powertools==2.30.0

# requirements-dev.txt
pytest==7.4.3
pytest-cov==4.1.0
black==23.12.1
ruff==0.1.9
mypy==1.8.0
mongomock==4.1.2
```

### 5.2 Configuración de Linting y Formatting

#### Black (Formatter)
```toml
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py312']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

#### Ruff (Linter - más rápido que Flake8 + isort)
```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "C90",    # mccabe complexity
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "B",      # flake8-bugbear
    "A",      # flake8-builtins
    "COM",    # flake8-commas
    "C4",     # flake8-comprehensions
    "DTZ",    # flake8-datetimez
    "T10",    # flake8-debugger
    "EXE",    # flake8-executable
    "ISC",    # flake8-implicit-str-concat
    "ICN",    # flake8-import-conventions
    "G",      # flake8-logging-format
    "PIE",    # flake8-pie
    "T20",    # flake8-print
    "PT",     # flake8-pytest-style
    "Q",      # flake8-quotes
    "RSE",    # flake8-raise
    "RET",    # flake8-return
    "SLF",    # flake8-self
    "SIM",    # flake8-simplify
    "TID",    # flake8-tidy-imports
    "TCH",    # flake8-type-checking
    "ARG",    # flake8-unused-arguments
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate
    "PL",     # Pylint
    "TRY",    # tryceratops
    "RUF",    # Ruff-specific rules
]

ignore = [
    "E501",   # line too long (handled by black)
    "COM812", # trailing comma (handled by black)
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # Unused imports in __init__ files

[tool.ruff.mccabe]
max-complexity = 10

[tool.ruff.isort]
known-first-party = ["search_api"]
```

#### Mypy (Type Checking)
```toml
# pyproject.toml
[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
strict_equality = true

[[tool.mypy.overrides]]
module = "pymongo.*"
ignore_missing_imports = true
```

#### Pre-commit Hooks (Opcional pero Recomendado)
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic, types-pymongo]
```

### 5.3 Logging Strategy

```python
# src/utils/logger.py
import logging
import sys
from typing import Any

from pythonjsonlogger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional context."""

    def add_fields(
        self,
        log_record: dict[str, Any],
        record: logging.LogRecord,
        message_dict: dict[str, Any],
    ) -> None:
        super().add_fields(log_record, record, message_dict)
        log_record["level"] = record.levelname
        log_record["logger"] = record.name
        log_record["function"] = record.funcName
        log_record["line"] = record.lineno


def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """
    Configure structured JSON logging.

    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler with JSON formatting
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJsonFormatter(
        "%(timestamp)s %(level)s %(name)s %(message)s",
        timestamp=True,
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Usage
logger = setup_logger("search-api", "INFO")

# Example logs:
logger.info("Search request received", extra={
    "user_id": "123",
    "filters": {...},
    "request_id": "abc-123"
})

logger.error("MongoDB connection failed", extra={
    "error": str(error),
    "connection_string": uri,
    "retry_count": 3
}, exc_info=True)
```

### 5.4 Error Handling Strategy

```python
# src/utils/exceptions.py
from typing import Any


class SearchAPIException(Exception):
    """Base exception for Search API."""

    def __init__(self, message: str, status_code: int = 500, details: dict[str, Any] | None = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(SearchAPIException):
    """Raised when request validation fails."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message, status_code=400, details=details)


class DatabaseError(SearchAPIException):
    """Raised when database operations fail."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(message, status_code=500, details=details)


class AuthenticationError(SearchAPIException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


# src/handlers/search_handler.py
import traceback
from typing import Any

from src.utils.exceptions import SearchAPIException
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def error_response(
    exception: Exception,
    request_id: str,
) -> dict[str, Any]:
    """
    Generate standardized error response.

    Args:
        exception: The exception that occurred
        request_id: Request identifier for tracking

    Returns:
        API Gateway compatible error response
    """
    if isinstance(exception, SearchAPIException):
        status_code = exception.status_code
        error_message = exception.message
        error_details = exception.details
    else:
        status_code = 500
        error_message = "Internal server error"
        error_details = {"error": str(exception)}

    logger.error(
        f"Request failed: {error_message}",
        extra={
            "request_id": request_id,
            "status_code": status_code,
            "error_details": error_details,
            "traceback": traceback.format_exc(),
        },
    )

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({
            "success": False,
            "error": {
                "message": error_message,
                "code": status_code,
                "details": error_details,
            },
            "metadata": {
                "requestId": request_id,
            },
        }),
    }
```

---

## 6. Estructura de Archivos

### 6.1 Estructura Completa del Proyecto

```
apps/sls-search-python/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline
│       └── deploy.yml                # Deployment workflow
│
├── pulumi/                           # Infrastructure as Code
│   ├── __main__.py                   # Main Pulumi program
│   ├── Pulumi.yaml                   # Pulumi project config
│   ├── Pulumi.dev.yaml              # Dev stack config
│   ├── Pulumi.prod.yaml             # Prod stack config
│   ├── requirements.txt             # Pulumi dependencies
│   └── config/
│       ├── __init__.py
│       ├── lambda_config.py         # Lambda configurations
│       ├── api_gateway_config.py    # API Gateway setup
│       └── monitoring_config.py     # CloudWatch alarms
│
├── src/                              # Application source code
│   ├── __init__.py
│   │
│   ├── handlers/                     # Lambda handlers
│   │   ├── __init__.py
│   │   └── search_handler.py        # Main search endpoint
│   │
│   ├── services/                     # Business logic
│   │   ├── __init__.py
│   │   ├── search_service.py        # Search orchestration
│   │   └── mongodb_service.py       # Database operations
│   │
│   ├── models/                       # Data models
│   │   ├── __init__.py
│   │   ├── request.py               # Request models (Pydantic)
│   │   ├── response.py              # Response models
│   │   └── term.py                  # Term entity model
│   │
│   ├── repositories/                 # Data access layer
│   │   ├── __init__.py
│   │   └── term_repository.py       # MongoDB queries
│   │
│   ├── utils/                        # Utilities
│   │   ├── __init__.py
│   │   ├── logger.py                # Logging setup
│   │   ├── exceptions.py            # Custom exceptions
│   │   ├── config.py                # Configuration management
│   │   └── response_builder.py      # API response helpers
│   │
│   └── middleware/                   # Lambda middleware
│       ├── __init__.py
│       ├── error_handler.py         # Global error handling
│       └── request_validator.py     # Request validation
│
├── tests/                            # Test suite
│   ├── __init__.py
│   ├── conftest.py                  # Pytest fixtures
│   │
│   ├── unit/                         # Unit tests
│   │   ├── __init__.py
│   │   ├── test_search_service.py
│   │   ├── test_term_repository.py
│   │   └── test_validators.py
│   │
│   ├── integration/                  # Integration tests
│   │   ├── __init__.py
│   │   ├── test_mongodb_connection.py
│   │   └── test_search_handler.py
│   │
│   └── fixtures/                     # Test data
│       ├── __init__.py
│       ├── sample_terms.json
│       └── mock_requests.py
│
├── scripts/                          # Utility scripts
│   ├── deploy.sh                    # Deployment script
│   ├── test.sh                      # Run tests
│   └── local_invoke.py              # Local Lambda testing
│
├── .env.template                     # Environment variables template
├── .env.dev                          # Dev environment (gitignored)
├── .env.prod                         # Prod environment (gitignored)
│
├── .gitignore
├── .pre-commit-config.yaml          # Pre-commit hooks
├── pyproject.toml                   # Python project config
├── poetry.lock                      # Locked dependencies
├── requirements.txt                 # Production dependencies
├── requirements-dev.txt             # Development dependencies
│
├── pytest.ini                       # Pytest configuration
├── mypy.ini                         # MyPy configuration (alternative)
│
├── README.md                        # Project documentation
├── DEPLOYMENT.md                    # Deployment guide
└── CONTRIBUTING.md                  # Contribution guidelines
```

### 6.2 Archivos Clave Explicados

#### Pulumi Configuration (`pulumi/__main__.py`)
```python
"""
Main Pulumi program for Search API infrastructure.
Defines: Lambda, API Gateway, CloudWatch, IAM roles, API Keys.
"""
import json
import pulumi
import pulumi_aws as aws
from config.lambda_config import create_lambda_function
from config.api_gateway_config import create_api_gateway
from config.monitoring_config import create_monitoring

# Configuration
config = pulumi.Config()
environment = pulumi.get_stack()

# MongoDB credentials from Pulumi secrets
mongodb_uri = config.require_secret("mongodb_uri")
mongodb_database = config.get("mongodb_database") or "dictionary"

# Lambda Function
search_lambda = create_lambda_function(
    name=f"search-api-{environment}",
    environment_variables={
        "MONGODB_URI": mongodb_uri,
        "MONGODB_DATABASE": mongodb_database,
        "LOG_LEVEL": config.get("log_level") or "INFO",
        "ENVIRONMENT": environment,
    },
)

# API Gateway
api = create_api_gateway(
    name=f"search-api-gateway-{environment}",
    lambda_function=search_lambda,
)

# Monitoring
monitoring = create_monitoring(
    lambda_function=search_lambda,
    api_gateway=api,
)

# Outputs
pulumi.export("api_endpoint", api.url)
pulumi.export("lambda_arn", search_lambda.arn)
pulumi.export("api_key_id", api.api_key_id)
```

#### Lambda Handler (`src/handlers/search_handler.py`)
```python
"""
Main Lambda handler for advanced search endpoint.
Handles POST /v1/search requests.
"""
import json
import uuid
from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.models.request import SearchRequest
from src.services.search_service import SearchService
from src.utils.exceptions import ValidationError
from src.utils.logger import setup_logger
from src.utils.response_builder import success_response, error_response

logger = setup_logger(__name__)


def lambda_handler(event: dict[str, Any], context: LambdaContext) -> dict[str, Any]:
    """
    AWS Lambda handler for search endpoint.

    Args:
        event: API Gateway event
        context: Lambda context

    Returns:
        API Gateway compatible response
    """
    request_id = str(uuid.uuid4())

    logger.info(
        "Search request received",
        extra={
            "request_id": request_id,
            "path": event.get("path"),
            "method": event.get("httpMethod"),
        },
    )

    try:
        # Parse and validate request
        body = json.loads(event.get("body", "{}"))
        search_request = SearchRequest.model_validate(body)

        # Execute search
        search_service = SearchService()
        results = search_service.search(search_request)

        # Return success response
        return success_response(
            data=results,
            request_id=request_id,
        )

    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in request body", extra={"request_id": request_id})
        return error_response(
            ValidationError("Invalid JSON format"),
            request_id=request_id,
        )

    except Exception as e:
        return error_response(e, request_id=request_id)
```

---

## 7. Plan de Implementación Detallado

### Fase 1: Setup Inicial (Día 1)

#### 1.1 Crear Estructura del Proyecto
```bash
# Desde la raíz del monorepo
cd apps/
mkdir sls-search-python
cd sls-search-python

# Crear directorios
mkdir -p pulumi/config
mkdir -p src/{handlers,services,models,repositories,utils,middleware}
mkdir -p tests/{unit,integration,fixtures}
mkdir -p scripts

# Crear __init__.py files
find src tests -type d -exec touch {}/__init__.py \;
```

#### 1.2 Configurar Poetry (Recomendado)
```bash
# Instalar Poetry si no está instalado
curl -sSL https://install.python-poetry.org | python3 -

# Inicializar proyecto
poetry init --name search-api --python "^3.12"

# Agregar dependencias
poetry add pymongo pydantic pydantic-settings python-json-logger aws-lambda-powertools

# Agregar dependencias de desarrollo
poetry add --group dev pytest pytest-cov black ruff mypy mongomock pytest-mock

# Agregar dependencias de Pulumi
poetry add --group infra pulumi pulumi-aws
```

#### 1.3 Configurar pyproject.toml
```bash
# Copiar configuración de linting/formatting
cat > pyproject.toml << 'EOF'
[tool.poetry]
name = "search-api"
version = "1.0.0"
description = "Advanced search API for Dictionary app"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.12"
pymongo = "^4.6.1"
pydantic = "^2.5.3"
pydantic-settings = "^2.1.0"
python-json-logger = "^2.0.7"
aws-lambda-powertools = "^2.30.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-cov = "^4.1.0"
black = "^23.12.1"
ruff = "^0.1.9"
mypy = "^1.8.0"
mongomock = "^4.1.2"
pytest-mock = "^3.12.0"

[tool.poetry.group.infra.dependencies]
pulumi = "^3.100.0"
pulumi-aws = "^6.15.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

# Black configuration
[tool.black]
line-length = 100
target-version = ['py312']

# Ruff configuration
[tool.ruff]
line-length = 100
target-version = "py312"

# ... (rest of ruff config from section 5.2)

[tool.mypy]
python_version = "3.12"
warn_return_any = true
# ... (rest of mypy config from section 5.2)
EOF
```

#### 1.4 Configurar .gitignore
```bash
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
ENV/
env/
.venv

# Poetry
poetry.lock

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Environment variables
.env
.env.dev
.env.prod
.env.local

# Pulumi
pulumi/Pulumi.*.yaml
!pulumi/Pulumi.yaml
pulumi/.pulumi/

# AWS
.aws-sam/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
EOF
```

---

### Fase 2: Implementación de Modelos (Día 1-2)

#### 2.1 Request Models (`src/models/request.py`)
```python
"""
Request models for search API using Pydantic v2.
"""
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class LanguageFilter(BaseModel):
    """Language pair filter."""

    src: str = Field(..., min_length=2, max_length=2, description="Source language code")
    to: str = Field(..., min_length=2, max_length=2, description="Target language code")

    @field_validator("src", "to")
    @classmethod
    def lowercase_language(cls, v: str) -> str:
        return v.lower()


class SearchFilters(BaseModel):
    """Search filters for terms."""

    term: str | None = Field(None, min_length=1, description="Search term (partial match)")
    tags: list[str] = Field(default_factory=list, description="Filter by tags")
    types: list[str] = Field(default_factory=list, description="Filter by word types")
    levels: list[str] = Field(default_factory=list, description="Filter by CEFR levels")
    languages: LanguageFilter | None = Field(None, description="Language pair filter")
    is_sentence: bool | None = Field(None, description="Filter by sentence/word")

    @field_validator("tags", "types", "levels")
    @classmethod
    def remove_empty_strings(cls, v: list[str]) -> list[str]:
        return [item.strip() for item in v if item.strip()]


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    limit: int = Field(20, ge=1, le=100, description="Items per page (max 100)")


class SortParams(BaseModel):
    """Sort parameters."""

    field: Literal["createdAt", "updatedAt", "term"] = Field(
        "createdAt", description="Field to sort by"
    )
    order: Literal["asc", "desc"] = Field("desc", description="Sort order")


class SearchRequest(BaseModel):
    """Complete search request model."""

    user_id: str = Field(..., min_length=24, max_length=24, description="MongoDB ObjectId")
    filters: SearchFilters = Field(default_factory=SearchFilters)
    pagination: PaginationParams = Field(default_factory=PaginationParams)
    sort: SortParams = Field(default_factory=SortParams)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_id": "60a3e5b9c7d4e12345678901",
                    "filters": {
                        "term": "hello",
                        "tags": ["vocabulary"],
                        "types": ["noun", "verb"],
                        "levels": ["a1", "a2"],
                        "languages": {"src": "en", "to": "es"},
                        "is_sentence": False,
                    },
                    "pagination": {"page": 1, "limit": 20},
                    "sort": {"field": "createdAt", "order": "desc"},
                }
            ]
        }
    }
```

#### 2.2 Response Models (`src/models/response.py`)
```python
"""Response models."""
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total: int
    total_pages: int


class RequestMetadata(BaseModel):
    """Request tracking metadata."""

    request_id: str
    duration_ms: int | None = None


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response."""

    success: bool = True
    data: T
    metadata: RequestMetadata


class ErrorDetail(BaseModel):
    """Error details."""

    message: str
    code: int
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: ErrorDetail
    metadata: RequestMetadata
```

#### 2.3 Term Model (`src/models/term.py`)
```python
"""Term entity model."""
from datetime import datetime

from pydantic import BaseModel, Field


class Pronunciation(BaseModel):
    phonetic: str
    native_phonetic: str
    native_phonetic_details: str


class Example(BaseModel):
    sentence: str
    sentence_native: str


class DictionaryEntry(BaseModel):
    translation: str
    reverse_translation: list[str]


class Dictionary(BaseModel):
    type: str
    base_term: str
    entries: list[DictionaryEntry]


class Term(BaseModel):
    """Term entity matching MongoDB schema."""

    id: str = Field(..., alias="_id")
    src_language: str
    to_language: str
    term: str
    translation: str
    types: list[str]
    is_sentence: bool
    pronunciation: Pronunciation
    examples: list[Example]
    tags: list[str]
    dictionary: list[Dictionary]
    level: str
    audio: str | None = None  # Base64 or omitted
    image: str | None = None  # Base64 or omitted
    created_at: datetime
    updated_at: datetime

    model_config = {"populate_by_name": True}


class SearchResults(BaseModel):
    """Search results with pagination."""

    results: list[Term]
    pagination: PaginationMeta
```

---

### Fase 3: Capa de Datos (Día 2-3)

#### 3.1 MongoDB Service (`src/services/mongodb_service.py`)
```python
"""MongoDB connection management."""
import logging
from typing import ClassVar

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi

from src.utils.config import settings

logger = logging.getLogger(__name__)


class MongoDBService:
    """Singleton MongoDB connection manager."""

    _instance: ClassVar["MongoDBService | None"] = None
    _client: MongoClient | None = None
    _db: Database | None = None

    def __new__(cls) -> "MongoDBService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize MongoDB connection (lazy)."""
        if self._client is None:
            self._connect()

    def _connect(self) -> None:
        """Establish MongoDB connection."""
        try:
            logger.info("Connecting to MongoDB...")
            self._client = MongoClient(
                settings.MONGODB_URI,
                server_api=ServerApi("1"),
                connectTimeoutMS=5000,
                serverSelectionTimeoutMS=5000,
            )
            # Test connection
            self._client.admin.command("ping")
            self._db = self._client[settings.MONGODB_DATABASE]
            logger.info("MongoDB connected successfully")
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            raise

    @property
    def db(self) -> Database:
        """Get database instance."""
        if self._db is None:
            self._connect()
        return self._db  # type: ignore

    def close(self) -> None:
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")
```

#### 3.2 Term Repository (`src/repositories/term_repository.py`)
```python
"""Term repository for MongoDB operations."""
import logging
from typing import Any

from bson import ObjectId
from pymongo.collection import Collection

from src.models.request import SearchRequest
from src.models.term import Term
from src.services.mongodb_service import MongoDBService
from src.utils.config import settings

logger = logging.getLogger(__name__)


class TermRepository:
    """Repository for term-related database operations."""

    def __init__(self) -> None:
        """Initialize repository with MongoDB service."""
        self.db = MongoDBService().db
        self.user_terms_collection: Collection = self.db[settings.COLLECTION_USER_TERMS]
        self.terms_collection: Collection = self.db[settings.COLLECTION_TERMS]

    def search(self, request: SearchRequest) -> tuple[list[dict[str, Any]], int]:
        """
        Execute advanced search with filters.

        Args:
            request: Search request with filters

        Returns:
            Tuple of (results, total_count)
        """
        # Build query for user_terms
        user_query = self._build_user_terms_query(request)

        # Get pagination params
        skip = (request.pagination.page - 1) * request.pagination.limit
        limit = request.pagination.limit

        logger.info(
            "Executing search",
            extra={
                "user_id": request.user_id,
                "query": user_query,
                "skip": skip,
                "limit": limit,
            },
        )

        # Get user's term IDs with filters
        user_terms_cursor = (
            self.user_terms_collection.find(user_query)
            .skip(skip)
            .limit(limit)
        )
        user_terms = list(user_terms_cursor)

        # Get total count
        total_count = self.user_terms_collection.count_documents(user_query)

        if not user_terms:
            return [], total_count

        # Extract term IDs
        term_ids = [ut["termId"] for ut in user_terms]

        # Build query for terms collection
        terms_query = self._build_terms_query(request, term_ids)

        # Sort configuration
        sort_field_map = {
            "createdAt": "createdAt",
            "updatedAt": "updatedAt",
            "term": "term",
        }
        sort_direction = -1 if request.sort.order == "desc" else 1
        sort_field = sort_field_map.get(request.sort.field, "createdAt")

        # Fetch term details
        terms_cursor = self.terms_collection.find(terms_query).sort(
            sort_field, sort_direction
        )
        terms = list(terms_cursor)

        logger.info(f"Found {len(terms)} terms", extra={"total_count": total_count})

        return terms, total_count

    def _build_user_terms_query(self, request: SearchRequest) -> dict[str, Any]:
        """Build MongoDB query for user_terms collection."""
        query: dict[str, Any] = {"userId": ObjectId(request.user_id)}

        # Filter by tags
        if request.filters.tags:
            query["tags"] = {"$in": request.filters.tags}

        return query

    def _build_terms_query(
        self, request: SearchRequest, term_ids: list[ObjectId]
    ) -> dict[str, Any]:
        """Build MongoDB query for terms collection."""
        query: dict[str, Any] = {"_id": {"$in": term_ids}}

        # Filter by term (partial match, case-insensitive)
        if request.filters.term:
            query["term"] = {"$regex": request.filters.term, "$options": "i"}

        # Filter by types
        if request.filters.types:
            query["types"] = {"$in": request.filters.types}

        # Filter by levels
        if request.filters.levels:
            query["level"] = {"$in": request.filters.levels}

        # Filter by language pair
        if request.filters.languages:
            query["srcLanguage"] = request.filters.languages.src
            query["toLanguage"] = request.filters.languages.to

        # Filter by is_sentence
        if request.filters.is_sentence is not None:
            query["isSentence"] = request.filters.is_sentence

        return query
```

---

### Fase 4: Lógica de Negocio (Día 3)

#### 4.1 Search Service (`src/services/search_service.py`)
```python
"""Search service orchestration."""
import logging
import time
from typing import Any

from src.models.request import SearchRequest
from src.models.response import PaginationMeta, SearchResults
from src.models.term import Term
from src.repositories.term_repository import TermRepository
from src.utils.exceptions import DatabaseError

logger = logging.getLogger(__name__)


class SearchService:
    """Service for orchestrating search operations."""

    def __init__(self) -> None:
        """Initialize service with repository."""
        self.term_repository = TermRepository()

    def search(self, request: SearchRequest) -> dict[str, Any]:
        """
        Execute advanced search.

        Args:
            request: Validated search request

        Returns:
            Search results with pagination metadata
        """
        start_time = time.time()

        try:
            # Execute search
            raw_terms, total_count = self.term_repository.search(request)

            # Convert to Pydantic models
            terms = [self._map_term(term) for term in raw_terms]

            # Build pagination metadata
            pagination = PaginationMeta(
                page=request.pagination.page,
                limit=request.pagination.limit,
                total=total_count,
                total_pages=(
                    (total_count + request.pagination.limit - 1)
                    // request.pagination.limit
                ),
            )

            # Build response
            results = SearchResults(results=terms, pagination=pagination)

            duration_ms = int((time.time() - start_time) * 1000)
            logger.info(
                f"Search completed in {duration_ms}ms",
                extra={
                    "duration_ms": duration_ms,
                    "result_count": len(terms),
                    "total_count": total_count,
                },
            )

            return results.model_dump()

        except Exception as e:
            logger.error(f"Search failed: {e}", exc_info=True)
            raise DatabaseError("Failed to execute search") from e

    def _map_term(self, term_doc: dict[str, Any]) -> Term:
        """Map MongoDB document to Term model."""
        # Convert ObjectId to string
        term_doc["_id"] = str(term_doc["_id"])

        # Convert Binary to base64 string if present
        if "audio" in term_doc and term_doc["audio"]:
            # Assuming audio is Binary type from MongoDB
            term_doc["audio"] = None  # Or convert to base64 if needed

        if "image" in term_doc and term_doc["image"]:
            term_doc["image"] = None  # Or convert to base64 if needed

        # Map snake_case to camelCase for Pydantic
        mapped = {
            "_id": term_doc["_id"],
            "src_language": term_doc.get("srcLanguage", ""),
            "to_language": term_doc.get("toLanguage", ""),
            "term": term_doc.get("term", ""),
            "translation": term_doc.get("translation", ""),
            "types": term_doc.get("types", []),
            "is_sentence": term_doc.get("isSentence", False),
            "pronunciation": term_doc.get("pronunciation", {}),
            "examples": term_doc.get("examples", []),
            "tags": term_doc.get("tags", []),
            "dictionary": term_doc.get("dictionary", []),
            "level": term_doc.get("level", "a1"),
            "audio": term_doc.get("audio"),
            "image": term_doc.get("image"),
            "created_at": term_doc.get("createdAt"),
            "updated_at": term_doc.get("updatedAt"),
        }

        return Term.model_validate(mapped)
```

---

### Fase 5: Handler y Utils (Día 4)

#### 5.1 Configuration (`src/utils/config.py`)
```python
"""Application configuration using Pydantic Settings."""
import logging

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # MongoDB
    MONGODB_URI: str
    MONGODB_DATABASE: str = "dictionary"
    COLLECTION_TERMS: str = "terms"
    COLLECTION_USER_TERMS: str = "userTerms"

    # Logging
    LOG_LEVEL: str = "INFO"

    # Environment
    ENVIRONMENT: str = "dev"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Global settings instance
settings = Settings()  # type: ignore

# Configure logging level
logging.basicConfig(level=settings.LOG_LEVEL)
```

#### 5.2 Response Builder (`src/utils/response_builder.py`)
```python
"""API response builders."""
import json
from typing import Any

from src.models.response import (
    ErrorDetail,
    ErrorResponse,
    RequestMetadata,
    SuccessResponse,
)


def success_response(
    data: Any,
    request_id: str,
    duration_ms: int | None = None,
) -> dict[str, Any]:
    """
    Build successful API Gateway response.

    Args:
        data: Response data
        request_id: Request identifier
        duration_ms: Request duration in milliseconds

    Returns:
        API Gateway response dict
    """
    metadata = RequestMetadata(request_id=request_id, duration_ms=duration_ms)
    response = SuccessResponse(data=data, metadata=metadata)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-Request-ID": request_id,
        },
        "body": response.model_dump_json(),
    }


def error_response(
    exception: Exception,
    request_id: str,
) -> dict[str, Any]:
    """
    Build error API Gateway response.

    Args:
        exception: Exception that occurred
        request_id: Request identifier

    Returns:
        API Gateway error response dict
    """
    from src.utils.exceptions import SearchAPIException

    if isinstance(exception, SearchAPIException):
        status_code = exception.status_code
        error_message = exception.message
        error_details = exception.details
    else:
        status_code = 500
        error_message = "Internal server error"
        error_details = {"error": str(exception)}

    metadata = RequestMetadata(request_id=request_id)
    error_detail = ErrorDetail(
        message=error_message, code=status_code, details=error_details
    )
    error_resp = ErrorResponse(error=error_detail, metadata=metadata)

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-Request-ID": request_id,
        },
        "body": error_resp.model_dump_json(),
    }
```

#### 5.3 Complete Handler Implementation
Ya está definido en la sección 6.2.

---

### Fase 6: Infraestructura con Pulumi (Día 5)

#### 6.1 Lambda Configuration (`pulumi/config/lambda_config.py`)
```python
"""Lambda function configuration."""
import pulumi
import pulumi_aws as aws
from pulumi import Output


def create_lambda_function(
    name: str,
    environment_variables: dict[str, Output[str] | str],
) -> aws.lambda_.Function:
    """
    Create Lambda function with best practices.

    Args:
        name: Function name
        environment_variables: Environment variables

    Returns:
        Lambda function resource
    """
    # IAM Role for Lambda
    lambda_role = aws.iam.Role(
        f"{name}-role",
        assume_role_policy="""{
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                }
            }]
        }""",
    )

    # Attach basic execution policy
    aws.iam.RolePolicyAttachment(
        f"{name}-basic-execution",
        role=lambda_role.name,
        policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    )

    # Package Lambda code
    # NOTE: This assumes you have a deployment package ready
    # In production, use `pulumi-aws-lambda` or custom packaging
    lambda_function = aws.lambda_.Function(
        name,
        code=pulumi.FileArchive("../lambda_package.zip"),  # Build this in CI/CD
        role=lambda_role.arn,
        handler="src.handlers.search_handler.lambda_handler",
        runtime="python3.12",
        timeout=30,
        memory_size=512,
        environment=aws.lambda_.FunctionEnvironmentArgs(
            variables=environment_variables,
        ),
        tags={
            "Environment": pulumi.get_stack(),
            "Project": "dictionary",
            "ManagedBy": "pulumi",
        },
    )

    return lambda_function
```

#### 6.2 API Gateway Configuration (`pulumi/config/api_gateway_config.py`)
```python
"""API Gateway configuration with API Key authentication."""
import pulumi
import pulumi_aws as aws


def create_api_gateway(
    name: str,
    lambda_function: aws.lambda_.Function,
) -> dict:
    """
    Create REST API Gateway with API Key authentication.

    Args:
        name: API Gateway name
        lambda_function: Lambda function to integrate

    Returns:
        Dictionary with API Gateway resources
    """
    # REST API
    api = aws.apigateway.RestApi(
        name,
        description=f"Search API - {pulumi.get_stack()}",
        endpoint_configuration=aws.apigateway.RestApiEndpointConfigurationArgs(
            types="REGIONAL",
        ),
    )

    # Resource: /v1
    v1_resource = aws.apigateway.Resource(
        f"{name}-v1",
        rest_api=api.id,
        parent_id=api.root_resource_id,
        path_part="v1",
    )

    # Resource: /v1/search
    search_resource = aws.apigateway.Resource(
        f"{name}-search",
        rest_api=api.id,
        parent_id=v1_resource.id,
        path_part="search",
    )

    # Method: POST /v1/search
    search_method = aws.apigateway.Method(
        f"{name}-search-post",
        rest_api=api.id,
        resource_id=search_resource.id,
        http_method="POST",
        authorization="NONE",
        api_key_required=True,  # Require API Key
    )

    # Lambda Integration
    integration = aws.apigateway.Integration(
        f"{name}-integration",
        rest_api=api.id,
        resource_id=search_resource.id,
        http_method=search_method.http_method,
        integration_http_method="POST",
        type="AWS_PROXY",
        uri=lambda_function.invoke_arn,
    )

    # Lambda Permission for API Gateway
    aws.lambda_.Permission(
        f"{name}-api-gateway-invoke",
        action="lambda:InvokeFunction",
        function=lambda_function.name,
        principal="apigateway.amazonaws.com",
        source_arn=api.execution_arn.apply(lambda arn: f"{arn}/*/*"),
    )

    # Deployment
    deployment = aws.apigateway.Deployment(
        f"{name}-deployment",
        rest_api=api.id,
        # Force new deployment on changes
        opts=pulumi.ResourceOptions(depends_on=[integration]),
    )

    # Stage
    stage = aws.apigateway.Stage(
        f"{name}-stage",
        rest_api=api.id,
        deployment=deployment.id,
        stage_name=pulumi.get_stack(),
        xray_tracing_enabled=True,
    )

    # API Key
    api_key = aws.apigateway.ApiKey(
        f"{name}-api-key",
        description=f"API Key for {name}",
    )

    # Usage Plan
    usage_plan = aws.apigateway.UsagePlan(
        f"{name}-usage-plan",
        api_stages=[
            aws.apigateway.UsagePlanApiStageArgs(
                api_id=api.id,
                stage=stage.stage_name,
            )
        ],
        quota_settings=aws.apigateway.UsagePlanQuotaSettingsArgs(
            limit=10000,
            period="DAY",
        ),
        throttle_settings=aws.apigateway.UsagePlanThrottleSettingsArgs(
            burst_limit=100,
            rate_limit=50,
        ),
    )

    # Usage Plan Key (associates API Key with Usage Plan)
    aws.apigateway.UsagePlanKey(
        f"{name}-usage-plan-key",
        key_id=api_key.id,
        key_type="API_KEY",
        usage_plan_id=usage_plan.id,
    )

    # Outputs
    api_url = pulumi.Output.concat(
        "https://", api.id, ".execute-api.", aws.config.region, ".amazonaws.com/", stage.stage_name
    )

    return {
        "api": api,
        "url": api_url,
        "api_key_id": api_key.id,
        "api_key_value": api_key.value,  # Store securely!
    }
```

#### 6.3 Main Pulumi Program (`pulumi/__main__.py`)
```python
"""Main Pulumi infrastructure program."""
import pulumi
import pulumi_aws as aws
from config.lambda_config import create_lambda_function
from config.api_gateway_config import create_api_gateway

# Configuration
config = pulumi.Config()
stack = pulumi.get_stack()

# Secrets
mongodb_uri = config.require_secret("mongodb_uri")
mongodb_database = config.get("mongodb_database") or "dictionary"
log_level = config.get("log_level") or "INFO"

# Lambda Function
lambda_func = create_lambda_function(
    name=f"search-api-{stack}",
    environment_variables={
        "MONGODB_URI": mongodb_uri,
        "MONGODB_DATABASE": mongodb_database,
        "LOG_LEVEL": log_level,
        "ENVIRONMENT": stack,
        "COLLECTION_TERMS": "terms",
        "COLLECTION_USER_TERMS": "userTerms",
    },
)

# API Gateway
api_resources = create_api_gateway(
    name=f"search-api-gateway-{stack}",
    lambda_function=lambda_func,
)

# CloudWatch Log Group
log_group = aws.cloudwatch.LogGroup(
    f"search-api-logs-{stack}",
    name=lambda_func.name.apply(lambda name: f"/aws/lambda/{name}"),
    retention_in_days=7,
    tags={
        "Environment": stack,
        "Project": "dictionary",
    },
)

# Exports
pulumi.export("lambda_arn", lambda_func.arn)
pulumi.export("lambda_name", lambda_func.name)
pulumi.export("api_endpoint", api_resources["url"])
pulumi.export("api_key_id", api_resources["api_key_id"])
# DON'T export api_key_value in production! Use Pulumi secrets.
pulumi.export("api_key_value", api_resources["api_key_value"])
```

---

### Fase 7: Testing (Día 6)

#### 7.1 Pytest Configuration (`pytest.ini`)
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    -v
    --strict-markers
    --tb=short
    --cov=src
    --cov-report=html
    --cov-report=term-missing
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
```

#### 7.2 Conftest (`tests/conftest.py`)
```python
"""Pytest fixtures."""
import pytest
from mongomock import MongoClient

from src.models.request import SearchRequest


@pytest.fixture
def mock_mongo_client(monkeypatch):
    """Mock MongoDB client."""
    client = MongoClient()
    # Populate with test data if needed
    return client


@pytest.fixture
def sample_search_request() -> SearchRequest:
    """Sample search request for testing."""
    return SearchRequest(
        user_id="60a3e5b9c7d4e12345678901",
        filters={
            "term": "hello",
            "tags": ["vocabulary"],
        },
        pagination={"page": 1, "limit": 20},
        sort={"field": "createdAt", "order": "desc"},
    )
```

#### 7.3 Unit Test Example (`tests/unit/test_search_service.py`)
```python
"""Unit tests for SearchService."""
import pytest

from src.services.search_service import SearchService


@pytest.mark.unit
def test_search_service_initialization():
    """Test that SearchService initializes correctly."""
    service = SearchService()
    assert service.term_repository is not None


@pytest.mark.unit
def test_map_term(sample_term_doc):
    """Test term mapping from MongoDB document."""
    service = SearchService()
    term = service._map_term(sample_term_doc)

    assert term.id == str(sample_term_doc["_id"])
    assert term.term == sample_term_doc["term"]
```

---

### Fase 8: Deployment (Día 7)

#### 8.1 Build Script (`scripts/build_lambda.sh`)
```bash
#!/bin/bash
set -e

echo "Building Lambda deployment package..."

# Clean previous builds
rm -rf build/
rm -f lambda_package.zip

# Create build directory
mkdir -p build/

# Install dependencies
pip install -r requirements.txt -t build/

# Copy source code
cp -r src/ build/

# Create zip
cd build/
zip -r ../lambda_package.zip . -x "*.pyc" -x "__pycache__/*"
cd ..

echo "Lambda package created: lambda_package.zip"
```

#### 8.2 Deployment Script (`scripts/deploy.sh`)
```bash
#!/bin/bash
set -e

STACK=$1

if [ -z "$STACK" ]; then
    echo "Usage: ./deploy.sh <stack-name>"
    exit 1
fi

echo "Deploying to stack: $STACK"

# Build Lambda package
./scripts/build_lambda.sh

# Deploy with Pulumi
cd pulumi/
pulumi stack select $STACK
pulumi up --yes

echo "Deployment completed!"
```

---

## 8. Checklist de Validación

### Pre-Implementation
- [ ] Decisión de stack confirmada (Opción A/B/C)
- [ ] Acceso a MongoDB Atlas configurado
- [ ] Credenciales AWS disponibles
- [ ] Python 3.12 instalado localmente
- [ ] Poetry o pip configurado

### Development
- [ ] Estructura de proyecto creada
- [ ] Modelos Pydantic implementados
- [ ] Validación de requests funciona
- [ ] Conexión MongoDB establecida
- [ ] Repository layer implementado
- [ ] Service layer implementado
- [ ] Handler implementado
- [ ] Logging configurado
- [ ] Error handling implementado

### Testing
- [ ] Unit tests escritos (>80% coverage)
- [ ] Integration tests con MongoDB
- [ ] Tests de validación Pydantic
- [ ] Todos los tests pasan

### Infrastructure
- [ ] Pulumi project inicializado
- [ ] Lambda configuration completa
- [ ] API Gateway configurado
- [ ] API Key authentication funcionando
- [ ] CloudWatch logs configurados
- [ ] IAM roles correctos

### Deployment
- [ ] Build script funciona
- [ ] Deploy a dev stack exitoso
- [ ] API endpoint accesible
- [ ] API Key funciona
- [ ] Logs visibles en CloudWatch
- [ ] Performance aceptable (<2s p95)

### Production Ready
- [ ] Deploy a prod stack
- [ ] Rate limiting configurado
- [ ] Monitoring/alertas configuradas
- [ ] Documentación completada
- [ ] Secrets gestionados correctamente
- [ ] Backup/rollback plan definido

---

## 9. Recursos y Referencias

### Documentación Oficial
- **Python 3.12**: https://docs.python.org/3.12/
- **AWS Lambda Python**: https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html
- **Pulumi AWS**: https://www.pulumi.com/docs/clouds/aws/
- **PyMongo**: https://pymongo.readthedocs.io/
- **Pydantic**: https://docs.pydantic.dev/latest/

### Herramientas Recomendadas
- **Black**: https://black.readthedocs.io/
- **Ruff**: https://docs.astral.sh/ruff/
- **Mypy**: https://mypy.readthedocs.io/
- **Pytest**: https://docs.pytest.org/

### Best Practices
- **AWS Lambda Best Practices**: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- **Python Serverless**: https://serverlessland.com/patterns?framework=Python
- **API Design**: https://restfulapi.net/

### Empresas con Stack Similar
- **Netflix**: Python + AWS Lambda
- **Spotify**: Python microservices
- **Uber**: Python + Go services
- **Instagram**: Python (Django) backend

---

## Próximos Pasos Inmediatos

1. **DECISION REQUIRED**: Confirmar Opción A, B o C
2. **ACCESS**: Validar acceso a MongoDB y AWS
3. **SETUP**: Ejecutar Fase 1 (Setup Inicial)
4. **KICKOFF**: Comenzar implementación según plan

---

## Notas Adicionales

### Estimaciones de Tiempo
- **Opción A (Python nuevo)**: 5-7 días desarrollo + 2 días testing
- **Opción B (Híbrido)**: 3-4 días desarrollo + 1 día testing
- **Opción C (Migración total)**: 3-4 semanas

### Costos Estimados AWS
- **Lambda**: ~$0.20/millón requests (512MB, 1s avg)
- **API Gateway**: ~$3.50/millón requests
- **CloudWatch Logs**: ~$0.50/GB
- **Estimado mensual (10k req/día)**: <$5/mes

---

**Documento creado**: 2025-12-11
**Versión**: 1.0
**Autor**: Claude AI Assistant
**Próxima revisión**: Después de decisión de stack
