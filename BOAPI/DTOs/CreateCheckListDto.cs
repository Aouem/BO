using System.Collections.Generic;

namespace BOAPI.DTOs
{
   public class CreateCheckListDto
{
    public string Libelle { get; set; } = string.Empty;
        public List<CreateEtapeDto> Etapes { get; set; } = new(); // <-- ajouté
}
}
