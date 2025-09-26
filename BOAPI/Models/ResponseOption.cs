namespace BOAPI.Models;

public class ResponseOption
{
    public int Id { get; set; }
    public string Valeur { get; set; } = string.Empty;

    public int QuestionId { get; set; }
    public Question? Question { get; set; }
}
