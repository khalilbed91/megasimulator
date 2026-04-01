# Build image for the Api project (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/Api ./src/Api
COPY src/Domain ./src/Domain
COPY src/Application ./src/Application
COPY src/Infrastructure ./src/Infrastructure
COPY docs/knowledge-base/params/2026.json ./docs/knowledge-base/params/2026.json

WORKDIR /src/src/Api
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
COPY --from=build /src/docs/knowledge-base/params/2026.json ./docs/knowledge-base/params/2026.json

# Include SQL migrations in the runtime image so startup migration runner can apply them.
# Program.cs / MigrationRunner look for src/Infrastructure/Migrations (relative to working dir / app base dir).
COPY --from=build /src/src/Infrastructure/Migrations ./src/Infrastructure/Migrations

ENV ASPNETCORE_URLS=http://+:80
ENV PARAMS_FILE=/app/docs/knowledge-base/params/2026.json
EXPOSE 80
ENTRYPOINT ["dotnet", "Api.dll"]
