import rentalsRepository from "repositories/rentals-repository";
import rentalsService, { getUserForRental } from "services/rentals-service";
import { faker } from "@faker-js/faker"
import { notFoundError } from "errors/notfound-error";
import usersRepository from "repositories/users-repository";

function generateUser() {
  return {
    id: faker.number.int({ min: 1, max: 30000 }),
    birthDate: new Date(),
    cpf: faker.animal.cow(),
    email: faker.animal.bird(),
    name: faker.animal.cat(),
    lastName: faker.animal.cetacean(),
  }
}
function generateRentals({ userId }) {
  return {
    id: faker.number.int({ min: 1, max: 30000 }),
    date: new Date(),
    endDate: new Date(),
    userId,
    closed: false
  }
}

function generateMovies({ rentalId = null, adultsOnly = false }) {
  return {
    id: faker.number.int({ min: 1, max: 30000 }),
    name: faker.animal.dog(),
    adultsOnly,
    rentalId,
  }
}

describe("Rentals Service Unit Tests", () => {
  describe("GET /rentals service", () => {
    it("Should return rentals if exists", async () => {
      const user = generateUser()
      jest.spyOn(rentalsRepository, "getRentals").mockImplementationOnce((): any => {
        return [generateRentals({ userId: user.id })]
      })
      const [rental] = await rentalsService.getRentals()
      expect(rental).toHaveProperty("id");
      expect(rental).toHaveProperty("date");
      expect(rental).toHaveProperty("endDate");
      expect(rental).toHaveProperty("userId");
      expect(rental).toHaveProperty("closed");
    })
    it("Should return empty array if does not exists rentals", async () => {
      const user = generateUser()
      jest.spyOn(rentalsRepository, "getRentals").mockImplementationOnce((): any => {
        return []
      })
      const rentals = await rentalsService.getRentals()
      expect(rentals).toHaveLength(0);
    })
  })
  describe("GET /rentals/:id", () => {
    it("Should return a rental if id exists", async () => {
      const user = generateUser()
      const rental = generateRentals({ userId: user.id })
      jest.spyOn(rentalsRepository, "getRentalById").mockImplementationOnce((): any => {
        return rental
      })
      const rentalFromService = await rentalsService.getRentalById(rental.id)
      expect(rentalFromService).toEqual(rental);
    })
    it("Should reject with a notFoundError if rental does not exists", async () => {
      const user = generateUser()
      const rental = generateRentals({ userId: user.id })
      const rentalFromService = rentalsService.getRentalById(100000000000000)
      expect(rentalFromService).rejects.toEqual(notFoundError());
    })

  })
  describe("POST /rentals", () => {
    describe("getUserForRental", () => {
      it("Should return user if exists", async () => {
        const user = generateUser();
        jest.spyOn(usersRepository, 'getById').mockImplementationOnce((): any => user);
        const userFromFunction = await getUserForRental(user.id)
        expect(userFromFunction).toEqual(user)
      })
      it("Should rejects if user does not exists", async () => {
        const user = generateUser();
        jest.spyOn(usersRepository, 'getById').mockImplementationOnce((): any => null);
        const promise = getUserForRental(123123123123)
        expect(promise).rejects.toEqual(notFoundError("User not found."))
      })
    })
    describe("checkUserAbleToRental", () => {
      it("Should return user if exists", async () => {
        const user = generateUser();
        const rental = generateRentals({ userId: user.id })
        jest.spyOn(rentalsRepository, 'getRentalsByUserId').mockImplementationOnce((): any => rental);
        const rentalFromFunction = await getUserForRental(user.id)
        expect(rentalFromFunction).toEqual(rental)
      })

    })
  })
})



 