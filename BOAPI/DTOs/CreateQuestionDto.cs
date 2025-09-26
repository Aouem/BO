namespace BOAPI.DTOs
{
    public class CreateQuestionDto
    {
        public string Texte { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string>? Options { get; set; }
        public int CheckListId { get; set; }
    }
}
