namespace MegaSimulator.Application.DTOs
{
    public class InsuranceRequestDto
    {
        public string Product { get; set; } = "home"; // home|auto|moto
        public string CoverageLevel { get; set; } = "standard_mrh";
        public string DeductibleLevel { get; set; } = "medium";
        public string PostalCode { get; set; } = "";
        public decimal ZoneFactor { get; set; } = 1m;
        public bool Persist { get; set; } = true;

        public HomeInsuranceInputDto? Home { get; set; }
        public VehicleInsuranceInputDto? Vehicle { get; set; }
    }

    public class HomeInsuranceInputDto
    {
        public string OccupantStatus { get; set; } = "tenant"; // tenant|owner_occupier|landlord|co_owner
        public string HousingType { get; set; } = "apartment"; // apartment|house
        public decimal SurfaceSqm { get; set; }
        public int Rooms { get; set; }
        public decimal ContentsValue { get; set; }
        public decimal ValuableItemsValue { get; set; }
        public bool HasAlarm { get; set; }
        public bool IsPrimaryResidence { get; set; } = true;
        public bool IsFurnishedRental { get; set; }
    }

    public class VehicleInsuranceInputDto
    {
        public decimal VehicleValue { get; set; }
        public int VehicleAgeYears { get; set; }
        public decimal PowerFiscalHp { get; set; }
        public string Energy { get; set; } = "gasoline";
        public string Usage { get; set; } = "private"; // private|commute|professional
        public int AnnualMileage { get; set; } = 10000;
        public string Parking { get; set; } = "private_parking"; // street|closed_garage|private_parking
        public int DriverAge { get; set; } = 35;
        public int LicenseYears { get; set; } = 10;
        public decimal Crm { get; set; } = 1m;
        public bool CrmApplicable { get; set; } = true;
        public int ClaimsLast36Months { get; set; }
        public string Category { get; set; } = "car"; // car|moped_50|scooter_125|motorcycle|maxi_scooter|quad
        public int EngineCc { get; set; }
        public string AntiTheftDevice { get; set; } = "approved_lock"; // none|approved_lock|alarm_tracker
        public string TechnicalInspectionStatus { get; set; } = "not_required_yet"; // not_required_yet|valid|overdue|unknown
        public decimal EquipmentValue { get; set; }
    }
}
