using System.Collections.Generic;

namespace BOAPI.DTOs
{
  public class CreateQuestionDto
{
    public string Texte { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Boolean", "Liste", "Texte"
    public List<CreateResponseOptionDto> Options { get; set; } = new();
}
}
