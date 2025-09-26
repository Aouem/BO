    
    namespace BOAPI.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string Texte { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
    }
}