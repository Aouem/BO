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
        public async Task<ActionResult<IEnumerable<CheckList>>> GetAll()
        {
            return await _context.CheckLists
                                 .Include(c => c.Questions)
                                 .ThenInclude(q => q.Options)
                                 .ToListAsync();
        }

        // GET: api/CheckList/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CheckList>> GetById(int id)
        {
            var item = await _context.CheckLists
                                     .Include(c => c.Questions)
                                     .ThenInclude(q => q.Options)
                                     .FirstOrDefaultAsync(c => c.Id == id);

            if (item == null) return NotFound();
            return item;
        }

        // POST: api/CheckList
        [HttpPost]
        public async Task<ActionResult<CheckList>> Create(CheckList item)
        {
            _context.CheckLists.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        // PUT: api/CheckList/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CheckList item)
        {
            if (id != item.Id) return BadRequest();

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CheckLists.Any(e => e.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/CheckList/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.CheckLists.FindAsync(id);
            if (item == null) return NotFound();

            _context.CheckLists.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("with-questions")]
public async Task<ActionResult<CheckList>> CreateWithQuestions(CreateCheckListDto dto)
{
    var checkList = new CheckList { Libelle = dto.Libelle };

    if (dto.Questions != null)
    {
        foreach (var q in dto.Questions)
        {
            var question = new Question
            {
                Texte = q.Texte,
                Type = Enum.Parse<QuestionType>(q.Type, true)
            };

            if (q.Options != null && question.Type == QuestionType.Liste)
            {
                foreach (var opt in q.Options)
                {
                    question.Options.Add(new ResponseOption { Valeur = opt });
                }
            }

            checkList.Questions.Add(question);
        }
    }

    _context.CheckLists.Add(checkList);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetById), new { id = checkList.Id }, checkList);
}

    }
}
