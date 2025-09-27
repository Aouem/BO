using System.Collections.Generic;

namespace BOAPI.DTOs
{
   public class CreateCheckListDto
{
    public string Libelle { get; set; } = string.Empty;
    public List<CreateQuestionDto> Questions { get; set; } = new();
}
}
