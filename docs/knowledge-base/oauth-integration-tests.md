OAuth integration/unit test (mocked)

What this test does
- Adds a focused test that exercises `AuthController.GoogleCallback` logic without contacting external Google endpoints or touching the database.
- Mocks `IGoogleAuthClient` to return a token and a userinfo payload.
- Replaces `IUserRepository` with a tiny in-memory fake to capture `AddAsync` calls.
- Verifies the controller redirects to the frontend URL with `?token=...` and that a user object was created.

Why this approach
- The project's `GoogleAuthClient` encapsulates external HTTP calls. Mocking that interface keeps the test deterministic and fast while exercising controller wiring, token generation and user creation logic.

Run the test
Run the following from the repository root:

```powershell
dotnet test ./tests/MegaSimulator.Tests/MegaSimulator.Tests.csproj -f net10.0
```

Notes
- This test is intended as an integration-style unit test (controller + small service fakes). For full end-to-end tests that spin up the app and mock external HTTP endpoints, consider using `WebApplicationFactory<TEntryPoint>` and a custom `IHttpClientFactory` that returns mocked `HttpClient` handlers.

Configuration Google (développement)
- Voir le README racine : section **Google Sign-In (OAuth)** et dépannage **`401 invalid_client`** (client Web, origines JavaScript `http://localhost:5173` / `127.0.0.1:5173`, même Client ID front `VITE_GOOGLE_CLIENT_ID` et API `GOOGLE__CLIENTID`).
- Ne jamais committer le **client secret** ; utiliser variables d’environnement ou `dotnet user-secrets`.
