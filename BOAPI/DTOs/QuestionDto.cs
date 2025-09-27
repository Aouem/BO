namespace BOAPI.DTOs
{
public class QuestionDto
{
    public int Id { get; set; }
    public string Texte { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // string pour l’API
    public List<ResponseOptionDto> Options { get; set; } = new();
    public string? Reponse { get; set; }
}
}