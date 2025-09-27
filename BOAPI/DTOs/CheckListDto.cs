using System.Collections.Generic;

namespace BOAPI.DTOs
{
    // Assure-toi que ce fichier n'est pas défini aussi dans CreateQuestionDto.cs
 public class CheckListDto
{
    public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;
    public List<QuestionDto> Questions { get; set; } = new();
}
}
