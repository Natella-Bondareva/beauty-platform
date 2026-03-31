using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class Role
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = null!;

        private Role() { }

        public Role(Guid id, string name)
        {
            Id = id;
            Name = name;
        }

        public static Role Create(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Role name is required");

            return new Role(Guid.NewGuid(), name);
        }
    }
}
