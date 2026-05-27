# Marugoto E-learning Platform

![Java](https://img.shields.io/badge/Java-17-%234275f5?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-%234275f5?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-%234275f5?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Compose-%234275f5?style=flat-square)

*Marugoto E-learning Platform is a Japanese language learning application that provides topic-based lessons, Can-do practice content, Kana learning resources, and admin APIs for managing learning content.*

## Table of Contents

- [The Goals of This Project](#the-goals-of-this-project)
- [Plan](#plan)
- [Technologies - Libraries](#technologies---libraries)
- [The Domain and Service Boundary](#the-domain-and-service-boundary)
- [Architecture](#architecture)
- [Structure of Project](#structure-of-project)
- [How to Run](#how-to-run)
- [API Overview](#api-overview)
- [Support](#support)
- [Contribution](#contribution)

## The Goals of This Project

❇️ Using `Spring Boot` for building a modular RESTful backend application.

❇️ Using `Spring Security` and `JWT` for stateless authentication and role-based authorization.

❇️ Using `Spring Data JPA` and `PostgreSQL` for persistence and relational data modeling.

❇️ Using `PostgreSQL JSONB` for storing flexible learning content structures.

❇️ Using `Docker Compose` for running the backend, database, and frontend services consistently.

❇️ Using `Nginx` for serving the static frontend distribution.

## Plan

| Feature | Status |
| --- | --- |
| User registration and login | Completed ✔️ |
| JWT authentication | Completed ✔️ |
| Role-based admin authorization | Completed ✔️ |
| Topic management APIs | Completed ✔️ |
| Lesson management APIs | Completed ✔️ |
| Can-do practice APIs | Completed ✔️ |
| Kana learning APIs | Completed ✔️ |
| PostgreSQL integration | Completed ✔️ |
| Docker Compose setup | Completed ✔️ |
| Static frontend serving with Nginx | Completed ✔️ |

## Technologies - Libraries

✔️ **[Java 17](https://openjdk.org/projects/jdk/17/)** - Main programming language for the backend application.

✔️ **[Spring Boot](https://spring.io/projects/spring-boot)** - Framework for building the backend REST API.

✔️ **[Spring Web](https://docs.spring.io/spring-framework/reference/web.html)** - Used to expose RESTful HTTP endpoints.

✔️ **[Spring Security](https://spring.io/projects/spring-security)** - Used for authentication, authorization, and endpoint protection.

✔️ **[JJWT](https://github.com/jwtk/jjwt)** - Used for generating and validating JSON Web Tokens.

✔️ **[Spring Data JPA](https://spring.io/projects/spring-data-jpa)** - Used for database access and repository abstraction.

✔️ **[Hibernate](https://hibernate.org/)** - ORM provider for mapping Java entities to PostgreSQL tables.

✔️ **[PostgreSQL](https://www.postgresql.org/)** - Main relational database for storing users and learning content.

✔️ **[Lombok](https://projectlombok.org/)** - Reduces boilerplate code for DTOs, entities, and services.

✔️ **[Gradle](https://gradle.org/)** - Build automation tool for compiling, testing, and packaging the application.

✔️ **[Docker](https://www.docker.com/)** - Used to containerize the backend application.

✔️ **[Docker Compose](https://docs.docker.com/compose/)** - Used to orchestrate backend, database, and frontend services.

✔️ **[Nginx](https://nginx.org/)** - Used to serve the static frontend distribution.

## The Domain and Service Boundary

**Authentication** handles user registration, login, current-user lookup, password hashing, and JWT-based authentication.

**Topic** manages learning topics with localized titles, slugs, descriptions, thumbnails, colors, type, ordering, and related lessons.

**Lesson** manages lessons that belong to topics and exposes APIs to retrieve lessons by topic.

**Can-do** manages practice objectives and structured practice content for each lesson.

**Kana** provides Hiragana and Katakana learning data grouped by character type and vocabulary.

## Architecture

The project follows a layered backend architecture:

```text
Client / Static Frontend
        |
        v
REST Controllers
        |
        v
Service Layer
        |
        v
Repositories
        |
        v
PostgreSQL Database
```

The backend exposes public APIs for learners and protected APIs for administrators. Authentication is stateless and handled through JWT tokens. Admin-only operations are protected with method-level authorization.

## Structure of Project

```text
marugoto
├── src
│   ├── main
│   │   ├── java/com/elearning/marugoto
│   │   │   ├── config          # Security, CORS, web configuration
│   │   │   ├── controller      # REST API controllers
│   │   │   ├── exception       # Application and global exception handling
│   │   │   ├── model           # Entities, DTOs, enums, JSON models
│   │   │   ├── repository      # JPA repositories
│   │   │   ├── security        # JWT filter, token provider, user details service
│   │   │   ├── service         # Business interfaces and implementations
│   │   │   └── util            # Mapper classes
│   │   └── resources
│   │       └── application.yml
│   └── test
├── frontend-dist              # Static frontend files served by Nginx
├── Dockerfile
├── docker-compose.yml
├── build.gradle
└── settings.gradle
```

## How to Run

### Prerequisites

- Java 17
- Gradle or Gradle Wrapper
- Docker and Docker Compose
- PostgreSQL, if running without Docker

### Environment Variables

Create a local environment file or export the following variables before running the application:

```env
DB_URL=jdbc:postgresql://localhost:5432/dev_marugoto
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_base64_jwt_secret
JWT_EXPIRATION=86400000
SPRING_PROFILES_ACTIVE=dev
```

### Build

```bash
./gradlew clean build
```

### Run Backend Locally

```bash
./gradlew bootRun
```

The backend runs on:

```text
http://localhost:8080
```

### Run with Docker Compose

```bash
docker compose up --build
```

The frontend is served through Nginx on:

```text
http://localhost
```

### Test

```bash
./gradlew test
```

## API Overview

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/me` | Get current authenticated user |

### Topics

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/topics` | Get paginated topics |
| GET | `/topics/{id}` | Get topic by id |
| GET | `/topics/slug/{slug}` | Get topic by slug |
| POST | `/topics` | Create topic, admin only |
| PUT | `/topics/{id}` | Update topic, admin only |
| DELETE | `/topics/{id}` | Delete topic, admin only |

### Lessons

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/lessons/{id}` | Get lesson by id |
| GET | `/lessons/by-topic/{topicId}` | Get lessons by topic |
| POST | `/lessons` | Create lesson, admin only |
| PUT | `/lessons/{id}` | Update lesson, admin only |
| DELETE | `/lessons/{id}` | Delete lesson, admin only |

### Can-do

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/can-do/{id}` | Get Can-do item by id |
| GET | `/can-do/by-lesson/{lessonId}` | Get Can-do items by lesson |
| POST | `/can-do` | Create Can-do item, admin only |
| PUT | `/can-do/{id}` | Update Can-do item, admin only |
| DELETE | `/can-do/{id}` | Delete Can-do item, admin only |

### Kana

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/kana/hiragana` | Get Hiragana learning data |
| GET | `/kana/katakana` | Get Katakana learning data |

## Support

If this project is useful for your learning or portfolio, consider giving it a star.

## Contribution

Contributions, issues, and feature requests are welcome. Please create an issue or submit a pull request with a clear description of the change.