public class UpdateQuestionDto
{
    public int Id { get; set; } // Id obligatoire
    public string? Texte { get; set; }
    public string? Type { get; set; }
    public List<UpdateResponseOptionDto>? Options { get; set; }
}