using System.Collections.Generic;

namespace BOAPI.DTOs
{
    // Assure-toi que ce fichier n'est pas défini aussi dans CreateQuestionDto.cs
    public class CreateCheckListDto
    {
        public string Libelle { get; set; } = string.Empty;
        public List<CreateQuestionDto>? Questions { get; set; } = new();
    }
}
