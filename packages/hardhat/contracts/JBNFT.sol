// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@jbx-protocol/contracts-v2/contracts/interfaces/IJBProjectPayer.sol";
import "@jbx-protocol/contracts-v2/contracts/libraries/JBTokens.sol";

contract JBNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public price = 0.01 ether;

    uint256 public juiceBoxProjectId;
    IJBProjectPayer public juiceBoxPayer;

    constructor(uint256 _juiceBoxProjectId, address payable _juiceBoxPayerAddress) ERC721("JBNFT", "JBNFT") {
        juiceBoxProjectId = _juiceBoxProjectId;
        juiceBoxPayer = IJBProjectPayer(_juiceBoxPayerAddress);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function mintItem() public payable returns (uint256) {
        require(msg.value >= price, "NOT ENOUGH");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, "QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr");

        // ToDo. set preferClaimedTokens param to TRUE?
        juiceBoxPayer.pay{value: msg.value}(juiceBoxProjectId, JBTokens.ETH, 0, 0, msg.sender, 0, false, "", "");

        return tokenId;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
