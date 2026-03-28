# Build image for the Api project (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/Api ./src/Api
COPY src/Domain ./src/Domain
COPY src/Application ./src/Application
COPY src/Infrastructure ./src/Infrastructure

WORKDIR /src/src/Api
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "Api.dll"]
