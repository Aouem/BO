using Microsoft.EntityFrameworkCore;
using BOAPI.Models;

namespace BOAPI.Data
{
    public static class DataSeeder
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new BOContext(
                serviceProvider.GetRequiredService<DbContextOptions<BOContext>>()))
            {
                SeedCheckListSecuritePatient(context);
            }
        }

        public static void SeedCheckListSecuritePatient(BOContext context)
        {
            // Vérifier si la checklist existe déjà
            var existingCheckList = context.CheckLists
                .Include(c => c.Etapes)
                    .ThenInclude(e => e.Questions)
                        .ThenInclude(q => q.Options)
                .FirstOrDefault(c => c.Libelle.Contains("SÉCURITÉ DU PATIENT AU BLOC OPÉRATOIRE"));

            if (existingCheckList != null)
            {
                Console.WriteLine("CheckList 'Sécurité du Patient' existe déjà. Skip du seed.");
                return;
            }

            Console.WriteLine("Création de la CheckList 'Sécurité du Patient'...");

            var checkList = new CheckList
            {
                Libelle = "CHECK-LIST « SÉCURITÉ DU PATIENT AU BLOC OPÉRATOIRE »",
                Version = "2018",
                Description = "Vérifier ensemble pour décider",
                DateCreation = DateTime.UtcNow,
                EstActive = true,
                Etapes = new List<Etape>
                {
                    // Étape 1: AVANT INDUCTION ANESTHÉSIQUE
                    new Etape
                    {
                        Nom = "AVANT INDUCTION ANESTHÉSIQUE - Temps de pause avant anesthésie",
                        Ordre = 0,
                        Questions = new List<Question>
                        {
                            new Question 
                            { 
                                Texte = "L'identité du patient est correcte", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "L'autorisation d'opérer est signée par les parents ou le représentant légal", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "L'intervention et le site opératoire sont confirmés : idéalement par le patient et, dans tous les cas, par le dossier ou procédure spécifique - la documentation clinique et sans clinique nécessaire est disponible en salle", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "Le mode d'installation est connu de l'équipe en salle, cohérent avec le site / l'intervention et non dangereux pour le patient", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "La préparation cutanée de l'opéré est documentée dans la fiche de liaison service / bloc opératoire (ou autre procédure en œuvre dans l'établissement)", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "L'équipement / le matériel nécessaires pour l'intervention sont vérifiés et adaptés au poids et à la taille du patient - pour la partie chirurgicale - pour la partie anesthésique", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "Le patient présente-t-il un : - risque allergique - risque d'inhalation, de difficulté d'intubation ou de ventilation au masque - risque de saignement important", 
                                Type = QuestionType.BooleanNA,
                                EstObligatoire = false
                            }
                        }
                    },
                    // Étape 2: AVANT INTERVENTION CHIRURGICALE
                    new Etape
                    {
                        Nom = "AVANT INTERVENTION CHIRURGICALE - Temps de pause avant incision (appelé aussi time-out)",
                        Ordre = 1,
                        Questions = new List<Question>
                        {
                            new Question 
                            { 
                                Texte = "Vérification « ultime » réalisée au sein de l'équipe en présence des chirurgiens(s), anesthésiste(s), IADE-BODEF/IDE - identité patient confirmée - intervention prévue confirmée - site opératoire confirmé - installation correcte confirmée - documents nécessaires disponibles (notamment imagerie)", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "Partage des informations essentielles oralement au sein de l'équipe sur les éléments à risque / étapes critiques de l'intervention (time-out) - sur le plan chirurgical - (temps opératoire difficile, points spécifiques de l'opération, identification des matériels nécessaires, confirmation de leur opérationnalité, etc.) - sur le plan anesthésique", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "L'antibiothérapie a été effectuée selon les recommandations et protocoles en vigueur dans l'établissement", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "La préparation du champ opératoire est réalisée selon le protocole en vigueur dans l'établissement", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            }
                        }
                    },
                    // Étape 3: APRÈS INTERVENTION
                    new Etape
                    {
                        Nom = "APRÈS INTERVENTION - Pause avant sortie de salle d'opération",
                        Ordre = 2,
                        Questions = new List<Question>
                        {
                            new Question 
                            { 
                                Texte = "Confirmation orale par le personnel auprès de l'équipe : - de l'intervention réalisée - du compte final correct - des compresses, aiguilles, instruments, etc. - de l'étiquetage des prélèvements, pièces opératoires, etc. - si des événements indésirables ou porteurs de risques médicaux sont survenus : ont-ils fait l'objet d'un signalement / déclaration ?", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            },
                            new Question 
                            { 
                                Texte = "Les prescriptions et la surveillance post-opératoires (y compris les seuils d'alerte spécifiques) sont faites complètement par l'équipe chirurgicale et anesthésique et adaptées à l'âge, au poids et à la taille du patient", 
                                Type = QuestionType.Boolean,
                                EstObligatoire = true
                            }
                        }
                    }
                }
            };

            context.CheckLists.Add(checkList);
            context.SaveChanges();

            Console.WriteLine("CheckList 'Sécurité du Patient' créée avec succès !");
        }

        // Méthode pour seed des personnels de test
        public static void SeedPersonnel(BOContext context)
        {
            if (!context.Personnels.Any())
            {
                var personnels = new List<Personnel>
                {
                    new Personnel { Nom = "DUPONT", Prenom = "Jean", Role = "Chirurgien", Matricule = "CHIR001" },
                    new Personnel { Nom = "MARTIN", Prenom = "Marie", Role = "Anesthésiste", Matricule = "ANES001" },
                    new Personnel { Nom = "BERNARD", Prenom = "Pierre", Role = "Infirmier", Matricule = "INF001" },
                    new Personnel { Nom = "DUBOIS", Prenom = "Sophie", Role = "IADE", Matricule = "IADE001" }
                };

                context.Personnels.AddRange(personnels);
                context.SaveChanges();

                Console.WriteLine("Personnels de test créés avec succès !");
            }
        }
    }
}