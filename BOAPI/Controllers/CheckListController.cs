using BOAPI.Data;
using BOAPI.Models;
using BOAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BOAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckListController : ControllerBase
    {
        private readonly BOContext _context;

        public CheckListController(BOContext context)
        {
            _context = context;
        }

        // GET: api/CheckList
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckListDto>>> GetAll()
        {
            var checkLists = await _context.CheckLists
                .Include(c => c.Questions)
                .ThenInclude(q => q.Options)
                .ToListAsync();

            var dtoList = checkLists.Select(c => MapToDto(c)).ToList();
            return dtoList;
        }

        // GET: api/CheckList/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CheckListDto>> GetById(int id)
        {
            var item = await _context.CheckLists
                .Include(c => c.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (item == null) return NotFound();

            return MapToDto(item);
        }

        // POST: api/CheckList/with-questions
        [HttpPost("with-questions")]
        public async Task<ActionResult<CheckListDto>> CreateWithQuestions(CreateCheckListDto dto)
        {
            var checkList = new CheckList { Libelle = dto.Libelle ?? string.Empty };

            if (dto.Questions != null)
            {
                foreach (var q in dto.Questions)
                {
                    if (string.IsNullOrEmpty(q.Type) || !Enum.TryParse<QuestionType>(q.Type, true, out var qType))
                        return BadRequest($"Type de question invalide : {q.Type}");

                    var question = new Question
                    {
                        Texte = q.Texte ?? string.Empty,
                        Type = qType
                    };

                    if (q.Options != null && question.Type == QuestionType.Liste)
                    {
                        foreach (var opt in q.Options)
                            question.Options.Add(new ResponseOption { Valeur = opt.Valeur ?? string.Empty });
                    }

                    checkList.Questions.Add(question);
                }
            }

            _context.CheckLists.Add(checkList);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = checkList.Id }, MapToDto(checkList));
        }

        // PUT: api/CheckList/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateCheckListDto dto)
        {
            var existing = await _context.CheckLists
                .Include(c => c.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null) return NotFound();

            existing.Libelle = dto.Libelle ?? string.Empty;

            // Supprimer les questions supprimées
            var toRemoveQuestions = existing.Questions
                .Where(q => dto.Questions == null || !dto.Questions.Any(dq => dq.Id == q.Id))
                .ToList();
            _context.Questions.RemoveRange(toRemoveQuestions);

            if (dto.Questions != null)
            {
                foreach (var qDto in dto.Questions)
                {
                    var q = existing.Questions.FirstOrDefault(x => x.Id == qDto.Id);
                    if (q != null)
                    {
                        q.Texte = qDto.Texte ?? string.Empty;
                        q.Type = !string.IsNullOrEmpty(qDto.Type) ? Enum.Parse<QuestionType>(qDto.Type, true) : q.Type;

                        if (q.Type == QuestionType.Liste)
                        {
                            var toRemoveOpts = q.Options
                                .Where(o => qDto.Options == null || !qDto.Options.Any(od => od.Id == o.Id))
                                .ToList();
                            _context.ResponseOptions.RemoveRange(toRemoveOpts);

                            if (qDto.Options != null)
                            {
                                foreach (var oDto in qDto.Options)
                                {
                                    var opt = q.Options.FirstOrDefault(o => o.Id == oDto.Id);
                                    if (opt != null)
                                        opt.Valeur = oDto.Valeur ?? string.Empty;
                                    else
                                        q.Options.Add(new ResponseOption { Valeur = oDto.Valeur ?? string.Empty });
                                }
                            }
                        }
                        else
                        {
                            _context.ResponseOptions.RemoveRange(q.Options);
                        }
                    }
                    else
                    {
                        var newQ = new Question
                        {
                            Texte = qDto.Texte ?? string.Empty,
                            Type = !string.IsNullOrEmpty(qDto.Type) ? Enum.Parse<QuestionType>(qDto.Type, true) : QuestionType.Texte,
                            Options = new List<ResponseOption>()
                        };

                        if (newQ.Type == QuestionType.Liste && qDto.Options != null)
                        {
                            foreach (var oDto in qDto.Options)
                                newQ.Options.Add(new ResponseOption { Valeur = oDto.Valeur ?? string.Empty });
                        }

                        existing.Questions.Add(newQ);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/CheckList/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.CheckLists
                .Include(c => c.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (item == null) return NotFound();

            _context.ResponseOptions.RemoveRange(item.Questions.SelectMany(q => q.Options));
            _context.Questions.RemoveRange(item.Questions);
            _context.CheckLists.Remove(item);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Mapping private
        private CheckListDto MapToDto(CheckList checkList) => new CheckListDto
        {
            Id = checkList.Id,
            Libelle = checkList.Libelle,
            Questions = checkList.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Texte = q.Texte,
                Type = q.Type.ToString(),
                Options = q.Options.Select(o => new ResponseOptionDto
                {
                    Id = o.Id,
                    Valeur = o.Valeur
                }).ToList()
            }).ToList()
        };
    }
}
