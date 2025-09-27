using System.Collections.Generic;

namespace BOAPI.DTOs
{
    public class CreateEtapeDto
    {
        public string? Nom { get; set; }
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }
}