   using System.Collections.Generic;
using BOAPI.DTOs; // <- ajoute ceci si CreateQuestionDto est dans le namespace BOAPI.DTOs


 public class CreateCheckListDto
{
    public string Libelle { get; set; } = string.Empty;
    public List<CreateQuestionDto>? Questions { get; set; } = new();
}
