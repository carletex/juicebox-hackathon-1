import { useContractReader } from "eth-hooks";
import React, { useEffect, useState } from "react";
import { List, Card } from "antd";
import { Address } from "../components";
import { ipfs } from "../helpers";

function MyContributions({ DEBUG, readContracts, mainnetProvider, blockExplorer, config }) {
  const totalSupply = useContractReader(readContracts, "JBNFT", "totalSupply");
  if (DEBUG) console.log("🤗 totalSupply:", totalSupply);

  const [nfts, setNfts] = useState();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 9;

  useEffect(() => {
    const updateNfts = async () => {
      if (readContracts.JBNFT && totalSupply) {
        setLoading(true);
        const collectibleUpdate = [];
        for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
          if (DEBUG) console.log("Getting NFT tokenId: ", tokenId);
          const tokenURI = await readContracts.JBNFT.tokenURI(tokenId);
          if (DEBUG) console.log("tokenURI: ", tokenURI);
          const owner = await readContracts.JBNFT.ownerOf(tokenId);
          if (DEBUG) console.log("owner: ", owner);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await ipfs.getFromIPFS(ipfsHash);

          const levels = config.nfts.levels;
          const level = levels.find(level => tokenURI.includes(level.metadataHash));
          const cachedImage = level.cachedImage;

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            collectibleUpdate.push({ id: tokenId, cachedImage, owner, uri: tokenURI, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        }
        setNfts(collectibleUpdate);
        setLoading(false);
      }
    };
    updateNfts();
    // eslint-disable-next-line
  }, [DEBUG, readContracts.JBNFT, (totalSupply || "0").toString()]);

  return (
    <div>
      <div style={{ margin: "auto", padding: 32, paddingBottom: 0 }}>
        <div>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 3,
            }}
            pagination={{
              total: totalSupply,
              defaultPageSize: perPage,
              defaultCurrent: page,
              onChange: currentPage => {
                setPage(currentPage);
              },
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${totalSupply} items`,
            }}
            loading={loading}
            dataSource={nfts}
            renderItem={item => {
              const id = item.id;

              return (
                <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                  <Card
                    style={{ border: "1px solid #0071bb", borderRadius: 10 }}
                    title={
                      <div>
                        <span style={{ fontSize: 18, marginRight: 8, fontWeight: "bold" }}>{item.id}</span>
                      </div>
                    }
                  >
                    <img
                      style={{ maxWidth: "100%", height: "auto" }}
                      src={item.cachedImage}
                      alt={"NFT #" + id}
                      width="380"
                      height="300"
                    />
                    <div style={{ marginTop: "10px" }}>
                      <Address
                        address={item.owner}
                        ensProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        fontSize={16}
                      />
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MyContributions;
