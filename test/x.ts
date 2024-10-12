import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("X", function () {
  async function deployContract() {
    const Contract = await hre.ethers.getContractFactory("X");
    const contract = await Contract.deploy()
    
    return contract
  }
  
  describe("Deployment", function () {
    it("Any address should have 0 posts at deployment", async function () {
      const contract = await deployContract()
      const [_, account] = await hre.ethers.getSigners()
      const posts = await contract.get_all_posts(account)

      expect(posts.length).to.be.equal(0);
    });
  });

  describe("Posts", function () {
    it("Create and get a post", async()=>{
      const contract = await loadFixture(deployContract)
      const [_, account] = await hre.ethers.getSigners()
      
      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      
      await contract.connect(account).create_post(post_to_test)
      const post = await contract.connect(account).get_post(account, 0)

      expect(post.content).to.be.equal(post_to_test)
      expect(post.autor).to.be.equal(account)
      expect(post.likes).to.be.equal(0)
    })

    it("Get all posts", async()=>{
      const contract = await loadFixture(deployContract)
      const [_,account] = await hre.ethers.getSigners()

      const post_to_test = "This is Chanchito Feliz reporting from my first post yeahhh!!!!"
      await contract.connect(account).create_post(post_to_test)
      
      const posts = await contract.connect(account).get_all_posts(account)

      expect(posts.length).to.be.equal(1)
    })
  });
  
  describe("Censored accounts", function () {
    
    it("Should fail if account is censored", async()=>{
      const contract = await loadFixture(deployContract)
      const [_, accountToCensure] = await hre.ethers.getSigners()

      await contract.set_censored_account(accountToCensure)
      
      await expect(contract.connect(accountToCensure).get_all_posts(accountToCensure)).to.be.revertedWith("This account is censored")
    })
  

  });

});
