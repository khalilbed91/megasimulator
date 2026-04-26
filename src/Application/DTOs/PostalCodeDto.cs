namespace MegaSimulator.Application.DTOs
{
    public class PostalCodeDto
    {
        public string PostalCode { get; set; } = "";
        public string City { get; set; } = "";
        public string DepartmentCode { get; set; } = "";
        public string DepartmentName { get; set; } = "";
        public string RegionName { get; set; } = "";
        public decimal ZoneFactor { get; set; } = 1m;
    }
}
