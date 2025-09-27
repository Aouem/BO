    public class UpdateEtapeDto
    {
        public int Id { get; set; }
        public string? Nom { get; set; }
        public List<UpdateQuestionDto>? Questions { get; set; }
    }