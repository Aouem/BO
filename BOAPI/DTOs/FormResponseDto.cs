public class FormResponseDto
{
    public int CheckListId { get; set; }
    public List<QuestionResponseDto> Reponses { get; set; } = new();
}