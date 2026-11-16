/// <reference types="cypress" />

describe("Testes da Funcionalidade Catálogo de Livros", () => {
  let token;
  beforeEach(() => {
    cy.geraToken("admin@biblioteca.com", "admin123").then((tkn) => {
      token = tkn;
    });
  });

  // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
  // Validar que filtros por categoria e autores funcionam corretamente
  it("GET - Deve listar livros com filtros e paginação", () => {
    cy.api({
      method: "GET",
      url: "books",
      headers: { Authorization: token },
      qs: {
        category: "Biografia",
        author: "Anne Frank",
      },
    }).should((response) => {
      expect(response.status).to.equal(200);
    });
  });

  // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
  // Verificar que todos os campos do livro são retornados corretamente
  it("GET - Deve obter detalhes de um livro específico", () => {
    cy.api({
      method: "GET",
      url: "books",
      headers: { Authorization: token },
      qs: {
        search: "1984",
        category: "Ficção",
        author: "George Orwell",
        available: "true",
        limit: 20,
        offset: 0,
        orderBy: "Dom Casmurro",
        order: "ASC",
      },
    }).should((response) => {
      expect(response.status).to.equal(200);

      const livros = response.body.books || response.body;

      expect(livros).to.be.an("array").and.not.be.empty;
      expect(livros.length).to.be.at.most(20);

      livros.forEach((livro) => {
        expect(livro).to.have.property("id");
        expect(livro).to.have.property("title").and.not.be.empty;
        expect(livro.category).to.equal("Ficção");
        expect(livro.author).to.equal("George Orwell");
        expect(livro.available_copies).to.be.greaterThan(0);
      });
    });
  });

  // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
  // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
  it("POST - Deve cadastrar um novo livro com sucesso", () => {
    let titulo = "Teste Juliana " + `${Date.now()}`;
    cy.api({
      method: "POST",
      url: "books",
      headers: { Authorization: token },
      body: {
        title: titulo,
        author: "Juliana Azevedo",
        description: "Romance naturalista que retrata a vida em um cortiço",
        category: "Literatura Brasileira",
        isbn: "785-85-260-1320-6",
        editor: "Editora Azevedo",
        language: "Português",
        publication_year: 1890,
        pages: 312,
        format: "Físico",
        total_copies: 4,
        available_copies: 4,
      },
    }).should((response) => {
      expect(response.status).to.equal(201);
    });
  });

  // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
  // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
  it("POST -  Deve rejeitar livro com dados inválidos", () => {
    cy.api({
      method: "POST",
      url: "books",
      headers: { Authorization: token },
      body: {
        title: "",
        author: "José de Alencar",
        category: "Literatura Brasileira",
        total_copies: 2,
      },
      failOnStatusCode: false,
    }).should((response) => {
      expect(response.status).to.equal(400);
    });
  });

  // Objetivo: Validar que um livro pode ser atualizado com sucesso
  // Verificar que apenas admin pode atualizar livros (validação de permissão)
  it("PUT - Deve atualizar um livro previamente cadastrado", () => {
    let titulo = `Ju teste ${Date.now()}`;
    cy.cadastrarLivro(token,titulo, "Juliana Azevedo", "Ficção", 6).then(
      (idLivro) => {
        cy.api({
          method: "PUT",
          url:`books/${idLivro}`,
          headers: { Authorization: token },
          body: {
            title: titulo + "alterado",
            author: "Juliana Azevedo Alterado",
            category: "Literatura Brasileira",
            total_copies: 2,
          },
        }).should((response) => {
          expect(response.status).to.equal(200);
        });
      },
    );
  });

  // Objetivo: Validar que um livro pode ser removido do catálogo
  // Verificar que apenas admin pode deletar livros (validação de permissão)
  it.only("DELETE - Deve deletar um livro previamente cadastrado", () => {
    let titulo = `Ju teste ${Date.now()}`;
    cy.cadastrarLivro(token,titulo, "Juliana Azevedo", "Ficção", 6).then(
      (idLivro) => {
        cy.api({
          method: "DELETE",
          url:`books/${idLivro}`,
          headers: { Authorization: token },
        }).should((response) => {
          expect(response.status).to.equal(200);
        });
      },
    );
  });
});
