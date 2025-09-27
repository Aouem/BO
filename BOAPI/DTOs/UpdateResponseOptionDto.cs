public class UpdateResponseOptionDto
{
    public int Id { get; set; } // Id obligatoire pour mettre à jour ou supprimer
    public required string Valeur { get; set; } // required pour éviter CS8618
}