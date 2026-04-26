using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class InsuranceService : IInsuranceService
    {
        private readonly ISimulationRepository? _simulationRepository;
        private readonly IPostalCodeService? _postalCodeService;

        public InsuranceService(ISimulationRepository? simulationRepository = null, IPostalCodeService? postalCodeService = null)
        {
            _simulationRepository = simulationRepository;
            _postalCodeService = postalCodeService;
        }

        private static decimal Money(decimal value) => decimal.Round(Math.Max(0m, value), 2);
        private static decimal Amount(decimal value) => decimal.Round(value, 2);
        private static decimal Coef(decimal value) => decimal.Round(value, 3);
        private static decimal Clamp(decimal value, decimal min, decimal max) => Math.Min(max, Math.Max(min, value));
        private static string Norm(string? value, string fallback) => string.IsNullOrWhiteSpace(value) ? fallback : value.Trim().ToLowerInvariant();

        public decimal UpdateCrm(decimal currentCrm, int fullResponsibleClaims, int partialResponsibleClaims, bool crmApplicable = true)
        {
            if (!crmApplicable) return Coef(currentCrm <= 0 ? 1m : currentCrm);

            var next = currentCrm <= 0 ? 1m : currentCrm;
            var full = Math.Max(0, fullResponsibleClaims);
            var partial = Math.Max(0, partialResponsibleClaims);

            for (var i = 0; i < full; i++) next *= 1.25m;
            for (var i = 0; i < partial; i++) next *= 1.125m;
            if (full == 0 && partial == 0) next *= 0.95m;

            return Coef(Clamp(next, 0.50m, 3.50m));
        }

        public async Task<InsuranceResponseDto> Simulate(InsuranceRequestDto req, Guid? userId = null)
        {
            var product = Norm(req.Product, "home");
            var coverage = Norm(req.CoverageLevel, product == "home" ? "standard_mrh" : "third_party");
            var deductible = Norm(req.DeductibleLevel, "medium");
            var zoneFactor = Clamp(req.ZoneFactor <= 0 ? 1m : req.ZoneFactor, 0.70m, 2.50m);
            PostalCodeDto? postalRef = null;
            if (product == "home" && _postalCodeService != null && !string.IsNullOrWhiteSpace(req.PostalCode))
            {
                postalRef = await _postalCodeService.GetBestMatchAsync(req.PostalCode);
                if (postalRef != null) zoneFactor = Clamp(postalRef.ZoneFactor, 0.70m, 2.50m);
            }
            var response = product switch
            {
                "auto" => SimulateVehicle(req, coverage, deductible, zoneFactor, isMoto: false),
                "moto" => SimulateVehicle(req, coverage, deductible, zoneFactor, isMoto: true),
                _ => SimulateHome(req, coverage, deductible, zoneFactor)
            };

            response.Product = product;
            response.CoverageLevel = coverage;
            response.DeductibleLevel = deductible;
            if (product == "home" && !string.IsNullOrWhiteSpace(req.PostalCode))
            {
                if (postalRef == null)
                    response.Warnings.Add("Code postal non trouvé dans le référentiel local : facteur zone standard utilisé.");
                else
                    response.Assumptions.Add($"Code postal vérifié : {postalRef.PostalCode} {postalRef.City} ({postalRef.DepartmentCode}), facteur zone {postalRef.ZoneFactor:0.###}.");
            }

            if (_simulationRepository != null && req.Persist && response.AnnualPremium > 0)
            {
                var sim = new Simulation
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = product == "home" ? "Home insurance simulation" : product == "moto" ? "Motorcycle insurance simulation" : "Car insurance simulation",
                    Type = "insurance",
                    Payload = JsonSerializer.Serialize(new { Request = req, Response = response }),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                try { await _simulationRepository.AddAsync(sim); }
                catch { /* history persistence must not block a simulation */ }
            }

            return response;
        }

        private InsuranceResponseDto SimulateHome(InsuranceRequestDto req, string coverage, string deductible, decimal zoneFactor)
        {
            var h = req.Home ?? new HomeInsuranceInputDto();
            var status = Norm(h.OccupantStatus, "tenant");
            var housing = Norm(h.HousingType, "apartment");
            var warnings = new List<string>();
            var assumptions = new List<string>
            {
                "Estimation indicative, non contractuelle ; les tarifs réels dépendent de l’assureur et de l’adresse exacte.",
                "Sources réglementaires : Service-Public.fr habitation / responsabilité civile / catastrophes naturelles."
            };

            var baseAnnual = coverage switch
            {
                "legal_minimum" => status == "co_owner" ? 45m : 85m,
                "premium_mrh" => 240m,
                _ => 145m
            };
            var legalMinimum = status == "co_owner" ? 45m : status == "tenant" ? 85m : 0m;
            var mandatory = status == "tenant" || status == "co_owner";
            var mandatoryLabel = status == "tenant"
                ? "Assurance risques locatifs obligatoire (incendie, explosion, dégâts des eaux)."
                : status == "co_owner"
                    ? "Responsabilité civile copropriétaire obligatoire."
                    : "Pas d’obligation générale hors copropriété, mais RC/MRH fortement recommandée.";

            if (status == "owner_occupier" && housing != "apartment")
                warnings.Add("Propriétaire occupant maison individuelle : pas d’obligation générale, mais les dommages aux tiers restent à votre charge sans assurance.");
            if (status == "landlord")
                warnings.Add("Propriétaire bailleur : la PNO est recommandée, et la RC est obligatoire en copropriété.");
            if (coverage == "legal_minimum" && status != "tenant" && status != "co_owner")
                warnings.Add("Le socle légal est très limité pour ce profil ; une MRH est généralement plus pertinente.");

            var surface = Math.Max(0m, h.SurfaceSqm);
            var contents = Math.Max(0m, h.ContentsValue);
            var valuables = Math.Max(0m, h.ValuableItemsValue);
            var surfacePart = surface * 1.35m;
            var contentsPart = contents * 0.0025m;
            var valuablesPart = valuables * 0.006m;
            var raw = baseAnnual + surfacePart + contentsPart + valuablesPart;
            var housingFactor = housing == "house" ? 1.18m : 1m;
            var alarmFactor = h.HasAlarm ? 0.97m : 1m;
            var residenceFactor = h.IsPrimaryResidence ? 1m : 1.08m;
            var furnishedFactor = h.IsFurnishedRental ? 1.06m : 1m;
            var risked = raw * housingFactor * zoneFactor * alarmFactor * residenceFactor * furnishedFactor;
            var discountRate = DeductibleDiscount(deductible);
            var discount = risked * discountRate;
            var annual = Money(risked - discount);

            return new InsuranceResponseDto
            {
                AnnualPremium = annual,
                MonthlyPremium = Money(annual / 12m),
                LegalMinimumAnnualPremium = Money(legalMinimum),
                CoverageAddonsAnnualPremium = Money(Math.Max(0m, baseAnnual - legalMinimum) + contentsPart + valuablesPart),
                RiskAdjustmentAmount = Amount(risked - raw),
                DeductibleDiscountAmount = Money(discount),
                CrmUsed = 1m,
                IsMandatoryInsurance = mandatory,
                MandatoryCoverageLabel = mandatoryLabel,
                Warnings = warnings,
                Assumptions = assumptions,
                Breakdown = new List<InsuranceBreakdownLineDto>
                {
                    new() { Label = "Base garantie", Amount = Money(baseAnnual) },
                    new() { Label = "Surface", Amount = Money(surfacePart) },
                    new() { Label = "Mobilier", Amount = Money(contentsPart) },
                    new() { Label = "Objets de valeur", Amount = Money(valuablesPart) }
                }
            };
        }

        private InsuranceResponseDto SimulateVehicle(InsuranceRequestDto req, string coverage, string deductible, decimal zoneFactor, bool isMoto)
        {
            var v = req.Vehicle ?? new VehicleInsuranceInputDto();
            var warnings = new List<string>();
            var assumptions = new List<string>
            {
                "Responsabilité civile obligatoire pour tout véhicule terrestre à moteur.",
                "Tarif pédagogique : pas un devis assureur ; marque, modèle exact, adresse et conditions contractuelles peuvent fortement changer le prix."
            };

            if (isMoto && Norm(v.TechnicalInspectionStatus, "unknown") == "overdue")
                warnings.Add("Contrôle technique catégorie L indiqué en retard : vérifiez la conformité avant circulation.");
            if (coverage != "all_risk" && Math.Max(0m, v.VehicleValue) > 25000m)
                warnings.Add("Véhicule de valeur élevée : une formule tous risques peut être plus adaptée.");
            if (!v.CrmApplicable)
                warnings.Add("CRM désactivé pour cette catégorie : certains deux-roues / véhicules sont exclus du bonus-malus.");

            var baseAnnual = isMoto
                ? coverage switch { "all_risk" => 560m, "theft_fire" or "third_party_plus" => 330m, _ => 180m }
                : coverage switch { "all_risk" => 680m, "third_party_plus" => 420m, _ => 260m };
            var legalMinimum = isMoto ? 180m : 260m;

            var value = Math.Max(0m, v.VehicleValue);
            var assetFactor = 1m + Math.Min(value / 50000m, 1.5m) * 0.25m;
            var driverFactor = DriverFactor(v.DriverAge, v.LicenseYears);
            var usageFactor = UsageFactor(v.Usage, v.AnnualMileage);
            var parkingFactor = ParkingFactor(v.Parking);
            var claimsFactor = 1m + Math.Max(0, v.ClaimsLast36Months) * 0.12m;
            var powerFactor = isMoto ? MotoEngineFactor(v.Category, v.EngineCc) : AutoPowerFactor(v.PowerFiscalHp);
            var antiTheftFactor = isMoto ? AntiTheftFactor(v.AntiTheftDevice) : 1m;
            var crm = v.CrmApplicable ? Clamp(v.Crm <= 0 ? 1m : v.Crm, 0.50m, 3.50m) : 1m;
            var equipmentPart = isMoto ? Math.Max(0m, v.EquipmentValue) * 0.035m : 0m;
            var raw = baseAnnual * assetFactor * driverFactor * usageFactor * parkingFactor * claimsFactor * powerFactor * antiTheftFactor * zoneFactor * crm + equipmentPart;
            var discount = raw * DeductibleDiscount(deductible);
            var annual = Money(raw - discount);

            return new InsuranceResponseDto
            {
                AnnualPremium = annual,
                MonthlyPremium = Money(annual / 12m),
                LegalMinimumAnnualPremium = Money(legalMinimum),
                CoverageAddonsAnnualPremium = Money(Math.Max(0m, baseAnnual - legalMinimum) + equipmentPart),
                RiskAdjustmentAmount = Amount(raw - baseAnnual - equipmentPart),
                DeductibleDiscountAmount = Money(discount),
                CrmUsed = Coef(crm),
                IsMandatoryInsurance = true,
                MandatoryCoverageLabel = "Responsabilité civile obligatoire (dommages causés aux tiers).",
                Warnings = warnings,
                Assumptions = assumptions,
                Breakdown = new List<InsuranceBreakdownLineDto>
                {
                    new() { Label = "Base formule", Amount = Money(baseAnnual) },
                    new() { Label = "Ajustements risque", Amount = Amount(raw - baseAnnual - equipmentPart) },
                    new() { Label = "Équipement", Amount = Money(equipmentPart) },
                    new() { Label = "Remise franchise", Amount = Amount(-discount) }
                }
            };
        }

        private static decimal DeductibleDiscount(string level) => level switch
        {
            "high" => 0.10m,
            "low" => 0m,
            _ => 0.05m
        };

        private static decimal DriverFactor(int age, int licenseYears)
        {
            var factor = 1m;
            if (age > 0 && age < 25) factor *= 1.35m;
            if (licenseYears < 2) factor *= 1.25m;
            else if (licenseYears < 5) factor *= 1.10m;
            return factor;
        }

        private static decimal UsageFactor(string? usage, int annualMileage)
        {
            var factor = Norm(usage, "private") switch
            {
                "professional" => 1.25m,
                "commute" => 1.10m,
                _ => 1m
            };
            if (annualMileage > 25000) factor *= 1.18m;
            else if (annualMileage > 15000) factor *= 1.08m;
            else if (annualMileage > 0 && annualMileage < 5000) factor *= 0.94m;
            return factor;
        }

        private static decimal ParkingFactor(string? parking) => Norm(parking, "private_parking") switch
        {
            "street" => 1.15m,
            "closed_garage" => 0.92m,
            _ => 1m
        };

        private static decimal AutoPowerFactor(decimal fiscalHp)
        {
            if (fiscalHp >= 12) return 1.18m;
            if (fiscalHp >= 8) return 1.10m;
            if (fiscalHp > 0 && fiscalHp <= 4) return 0.95m;
            return 1m;
        }

        private static decimal MotoEngineFactor(string? category, int engineCc)
        {
            var cat = Norm(category, "motorcycle");
            if (cat == "moped_50") return 0.72m;
            if (cat == "scooter_125") return 0.90m;
            if (cat == "maxi_scooter") return 1.15m;
            if (cat == "quad") return 1.20m;
            if (engineCc >= 1000) return 1.35m;
            if (engineCc >= 600) return 1.18m;
            return 1m;
        }

        private static decimal AntiTheftFactor(string? antiTheftDevice) => Norm(antiTheftDevice, "approved_lock") switch
        {
            "none" => 1.15m,
            "alarm_tracker" => 0.90m,
            _ => 1m
        };
    }
}
