public class UpdateCheckListDto
{
    public required string Libelle { get; set; }
    public List<UpdateQuestionDto> Questions { get; set; } = new(); // initialise pour éviter null
}